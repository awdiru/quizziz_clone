package ru.programschool.quizziz_clone.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.programschool.quizziz_clone.exception.list.AccessDeniedException;
import ru.programschool.quizziz_clone.exception.list.CopyException;
import ru.programschool.quizziz_clone.exception.list.ResourceNotFoundException;
import ru.programschool.quizziz_clone.model.dto.element.test.TestContentDto;
import ru.programschool.quizziz_clone.model.dto.element.test.answer.AnswerDto;
import ru.programschool.quizziz_clone.model.dto.element.test.question.QuestionDto;
import ru.programschool.quizziz_clone.model.entity.postgrsql.Answer;
import ru.programschool.quizziz_clone.model.entity.postgrsql.Question;
import ru.programschool.quizziz_clone.model.entity.postgrsql.Test;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.repository.postgrsql.ElementRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestService {
    private final ElementRepository elementRepository;
    private final FileSystemService fileSystemService;

    @Transactional
    public void saveTestContent(Long testId, List<QuestionDto> questionDtos, User user) {
        Test test = (Test) elementRepository.findById(testId)
                .filter(e -> e instanceof Test)
                .orElseThrow(() -> new ResourceNotFoundException("Тест с id " + testId + " не найден"));

        if (!fileSystemService.hasAccess(test, user, true)) throw new AccessDeniedException("Нет прав на редактирование этого теста");

        test.getQuestions().clear();

        for (QuestionDto qDto : questionDtos) {
            Question question = Question.builder()
                    .question(qDto.getQuestionText())
                    .test(test)
                    .build();

            List<Answer> answers = qDto.getAnswers().stream()
                    .map(aDto -> Answer.builder()
                            .answer(aDto.getAnswerText())
                            .number(aDto.getNumber())
                            .isRight(aDto.isRight())
                            .question(question)
                            .build())
                    .toList();

            question.setAnswers(answers);
            test.getQuestions().add(question);
        }

        elementRepository.save(test);
    }

    public TestContentDto getTestContent(Long testId, User user) {
        Test test = (Test) elementRepository.findById(testId)
                .filter(e -> e instanceof Test)
                .orElseThrow(() -> new ResourceNotFoundException("Тест с id " + testId + " не найден"));

        if (!fileSystemService.hasAccess(test, user, false))
            throw new AccessDeniedException("У вас нет прав на просмотр этого теста");

        return mapToTestContentDto(test, user);
    }

    public TestContentDto mapToTestContentDto(Test test, User user) {
        return TestContentDto.builder()
                .id(test.getId())
                .name(test.getName())
                .canEdit(fileSystemService.hasAccess(test, user, true))
                .questions(test.getQuestions().stream()
                        .map(this::mapToQuestionDto)
                        .toList())
                .build();
    }

    private QuestionDto mapToQuestionDto(Question q) {
        return QuestionDto.builder()
                .questionText(q.getQuestion())
                .answers(q.getAnswers().stream()
                        .map(a -> AnswerDto.builder()
                                .answerText(a.getAnswer())
                                .number(a.getNumber())
                                .isRight(a.getIsRight())
                                .build())
                        .toList())
                .build();
    }
}
