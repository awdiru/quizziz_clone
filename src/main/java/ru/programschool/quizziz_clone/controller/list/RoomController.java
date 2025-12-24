package ru.programschool.quizziz_clone.controller.list;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.programschool.quizziz_clone.controller.BaseController;
import ru.programschool.quizziz_clone.model.dto.room.JoinRoomRequest;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.model.entity.redis.Room;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;
import ru.programschool.quizziz_clone.service.RoomService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Игровые комнаты", description = "Создание и управление сессиями тестов")
public class RoomController extends BaseController {
    private final RoomService roomService;

    @Autowired
    public RoomController(UserRepository userRepository, RoomService roomService) {
        super(userRepository);
        this.roomService = roomService;
    }

    @PostMapping("/open/{testId}")
    @Operation(summary = "Открыть комнату", description = "Создает временную сессию в Redis и возвращает 5-значный код")
    public ResponseEntity<?> openRoom(@PathVariable Long testId, Principal principal) {
        User teacher = getUserFromPrincipal(principal);
        return ResponseEntity.ok(roomService.createRoom(testId, teacher));
    }

    @GetMapping("/get")
    @Operation(summary = "Вернуть комнату", description = "Возвращает полную информацию о комнате")
    public ResponseEntity<?> getRoom(@RequestParam String pin) {
        return ResponseEntity.ok(roomService.getRoom(pin));
    }

    @PostMapping("/join")
    @Operation(summary = "Присоединиться к комнате", description = "Публичный эндпоинт для учеников")
    public ResponseEntity<?> joinRoom(@RequestBody @Valid JoinRoomRequest request) {
        return ResponseEntity.ok(roomService.joinRoom(request));
    }

    @PostMapping("/{pin}/start")
    @Operation(summary = "Начать тест", description = "Переводит комнату в статус IN_PROGRESS и рассылает первый вопрос")
    public ResponseEntity<?> startQuiz(@PathVariable String pin, Principal principal) {
        User teacher = getUserFromPrincipal(principal);
        roomService.startQuiz(pin, teacher);
        return ResponseEntity.ok("Тест запущен");
    }

    @PostMapping("/{pin}/next")
    @Operation(summary = "Следующий вопрос", description = "Учитель переключает тест на следующий вопрос")
    public ResponseEntity<?> nextQuestion(@PathVariable String pin, Principal principal) {
        User teacher = getUserFromPrincipal(principal);
        roomService.nextQuestion(pin, teacher);
        return ResponseEntity.ok("Переход к следующему вопросу");
    }

    @PostMapping("/{pin}/finish")
    @Operation(summary = "Завершить тест", description = "Учитель закрывает комнату и выводит финальные результаты")
    public ResponseEntity<?> finishQuiz(@PathVariable String pin, Principal principal) {
        User teacher = getUserFromPrincipal(principal);
        List<Room.Participant> results = roomService.finishQuiz(pin, teacher);
        return ResponseEntity.ok(results);
    }
}