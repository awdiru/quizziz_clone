package ru.programschool.quizziz_clone.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.stylesheets.LinkStyle;
import ru.programschool.quizziz_clone.exception.list.AccessDeniedException;
import ru.programschool.quizziz_clone.exception.list.ResourceNotFoundException;
import ru.programschool.quizziz_clone.model.dto.room.AnswerSubmissionDto;
import ru.programschool.quizziz_clone.model.dto.room.JoinRoomRequest;
import ru.programschool.quizziz_clone.model.dto.room.JoinRoomResponse;
import ru.programschool.quizziz_clone.model.dto.room.QuestionExposedDto;
import ru.programschool.quizziz_clone.model.entity.postgrsql.Answer;
import ru.programschool.quizziz_clone.model.entity.postgrsql.Question;
import ru.programschool.quizziz_clone.model.entity.postgrsql.Test;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.model.entity.redis.Room;
import ru.programschool.quizziz_clone.repository.postgrsql.ElementRepository;
import ru.programschool.quizziz_clone.repository.redis.RoomRepository;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final ElementRepository elementRepository; // Проверить, что тест существует
    private final SimpMessagingTemplate messagingTemplate;

    public Room createRoom(Long testId, User teacher) {
        elementRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Тест не найден"));

        String pin = generateUniquePin();

        Room room = Room.builder()
                .id(pin)
                .testId(testId)
                .ownerId(teacher.getId())
                .status(Room.RoomStatus.WAITING)
                .build();

        return roomRepository.save(room);
    }

    public JoinRoomResponse joinRoom(JoinRoomRequest request) {
        Room room = getRoom(request.getPin());

        if (room.getStatus() != Room.RoomStatus.WAITING)
            throw new IllegalStateException("Нельзя присоединиться: тест уже начался или завершен");

        boolean nameExists = room.getParticipants().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(request.getName()));

        if (nameExists) throw new IllegalArgumentException("Имя " + request.getName() + " уже занято в этой комнате");

        Room.Participant newPlayer = new Room.Participant(request.getName(), 0, false, null);
        room.getParticipants().add(newPlayer);
        roomRepository.save(room);

        messagingTemplate.convertAndSend("/topic/room/" + room.getId(), room.getParticipants());
        return new JoinRoomResponse(room.getId(), request.getName(), "Успешное подключение");
    }

    @Transactional
    public void startQuiz(String pin, User teacher) {
        Room room = getRoom(pin);

        if (!room.getOwnerId().equals(teacher.getId()))
            throw new AccessDeniedException("Только учитель, создавший комнату, может запустить тест");

        if (room.getStatus() != Room.RoomStatus.WAITING)
            throw new IllegalStateException("Тест уже запущен или завершен");

        if (room.getParticipants().isEmpty())
            throw new IllegalArgumentException("Нельзя начать тест без участников");

        Test test = (Test) elementRepository.findById(room.getTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Тест не найден"));

        room.setCurrentQuestionIndex(0);
        room.setStatus(Room.RoomStatus.IN_PROGRESS);
        room.setCurrentQuestionStartTime(System.currentTimeMillis());

        roomRepository.save(room);
        sendQuestion(room, test);
    }

    @Transactional
    public void nextQuestion(String pin, User teacher) {
        Room room = getRoom(pin);

        if (!room.getOwnerId().equals(teacher.getId()))
            throw new AccessDeniedException("У вас нет прав для управления этой комнатой");

        if (room.getStatus() != Room.RoomStatus.IN_PROGRESS)
            throw new IllegalStateException("Тест не запущен");

        Test test = (Test) elementRepository.findById(room.getTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Тест не найден"));

        int nextIndex = room.getCurrentQuestionIndex() + 1;

        if (nextIndex >= test.getQuestions().size())
            throw new IllegalStateException("Вопросы закончились. Завершите тест.");

        room.setCurrentQuestionIndex(nextIndex);
        room.setCurrentQuestionStartTime(System.currentTimeMillis());
        room.getParticipants().forEach(participant -> {participant.setAnswered(false);});

        roomRepository.save(room);
        sendQuestion(room, test);
    }

    @Transactional
    public List<Room.Participant> finishQuiz(String pin, User teacher) {
        Room room = getRoom(pin);

        if (!room.getOwnerId().equals(teacher.getId()))
            throw new AccessDeniedException("У вас нет прав для завершения этого теста");

        room.setStatus(Room.RoomStatus.FINISHED);
        roomRepository.save(room);

        List<Room.Participant> leaders = room.getParticipants().stream()
                .sorted((p1, p2) -> Integer.compare(p2.getScore(), p1.getScore()))
                .toList();

        messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/finished", leaders);

        roomRepository.delete(room);
        return leaders;
    }

    @Transactional
    public void submitAnswer(AnswerSubmissionDto submission) {
        Room room = getRoom(submission.getPin());

        if (room.getStatus() != Room.RoomStatus.IN_PROGRESS)
            throw new IllegalStateException("Тест сейчас не проводится");

        Room.Participant participant = room.getParticipants().stream()
                .filter(p -> p.getName().equals(submission.getPlayerName()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Участник не найден"));

        Test test = (Test) elementRepository.findById(room.getTestId()).get();

        int qIndex = room.getCurrentQuestionIndex();
        Question question = test.getQuestions().get(qIndex);

        int score = calculateBaseScore(question, submission.getSelectedAnswerNumbers());

        if (score > 0) {
            long timeSpent = System.currentTimeMillis() - room.getCurrentQuestionStartTime();
            score = applyTimeBonus(score, timeSpent);
        }

        participant.setScore(participant.getScore() + score);
        participant.setLastAnswerTimestamp(System.currentTimeMillis());
        participant.setAnswered(true);

        roomRepository.save(room);

        messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/leaderboard", room.getParticipants());
    }

    private int calculateBaseScore(Question question, List<Integer> selectedNumbers) {
        List<Answer> allAnswers = question.getAnswers();
        long totalCorrect = allAnswers.stream().filter(Answer::getIsRight).count();

        long correctSelected = allAnswers.stream()
                .filter(a -> a.getIsRight() && selectedNumbers.contains(a.getNumber()))
                .count();

        long incorrectSelected = allAnswers.stream()
                .filter(a -> !a.getIsRight() && selectedNumbers.contains(a.getNumber()))
                .count();

        if (correctSelected == 0) return 0;

        double correctness = (double) correctSelected / totalCorrect;
        double penalty = (double) incorrectSelected / allAnswers.size();

        int finalScore = (int) ((correctness - penalty) * 1000);
        return Math.max(0, finalScore);
    }

    private int applyTimeBonus(int score, long timeSpentMs) {
        double multiplier = 1.0 + Math.max(0, (60000.0 - timeSpentMs) / 60000.0);
        return (int) (score * multiplier);
    }

    private void sendQuestion(Room room, Test test) {
        int questionIndex = room.getCurrentQuestionIndex();

        List<Question> questions = test.getQuestions();

        Question qEntity = questions.get(questionIndex);

        QuestionExposedDto questionDto = QuestionExposedDto.builder()
                .questionText(qEntity.getQuestion())
                .currentQuestionNumber(questionIndex)
                .totalQuestions(questions.size())
                .answers(qEntity.getAnswers().stream()
                        .map(a -> QuestionExposedDto.AnswerExposedDto.builder()
                                .answerText(a.getAnswer())
                                .number(a.getNumber())
                                .build())
                        .toList())
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + room.getId() + "/question", questionDto);
    }

    private String generateUniquePin() {
        String pin;
        do {
            pin = RandomStringGenerator.generateRandomString(5);
        } while (roomRepository.existsById(pin));
        return pin;
    }

    public Room getRoom(String pin) {
        return roomRepository.findById(pin)
                .orElseThrow(() -> new ResourceNotFoundException("Комната с кодом " + pin + " не найдена"));
    }
}