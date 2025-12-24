package ru.programschool.quizziz_clone.controller.list;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.programschool.quizziz_clone.controller.BaseController;
import ru.programschool.quizziz_clone.model.dto.element.test.TestQuestionsRequest;
import ru.programschool.quizziz_clone.model.dto.element.test.TestContentDto;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;
import ru.programschool.quizziz_clone.service.TestService;

import java.security.Principal;

@RestController
@RequestMapping("/api/tests")
@Tag(name = "Тесты", description = "Редактирование содержимого тестов (вопросы и ответы)")
@SecurityRequirement(name = "Bearer Authentication")
public class TestController extends BaseController {
    private final TestService testService;

    @Autowired
    public TestController(UserRepository userRepository, TestService testService) {
        super(userRepository);
        this.testService = testService;
    }

    @Operation(summary = "Обновить содержимое теста", description = "Полная перезапись вопросов и ответов в тесте")
    @PutMapping("/{id}/content")
    public ResponseEntity<?> updateTestContent(@PathVariable Long id,
                                               @RequestBody TestQuestionsRequest questions,
                                               Principal principal) {

        User user = getUserFromPrincipal(principal);
        testService.saveTestContent(id, questions.getQuestions(), user);
        return ResponseEntity.ok("Тест успешно сохранен");
    }

    @Operation(summary = "Получить содержимое теста", description = "Возвращает все вопросы и варианты ответов")
    @GetMapping("/{id}/content")
    public ResponseEntity<?> getTestContent(@PathVariable Long id, Principal principal) {
        User user = getUserFromPrincipal(principal);
        TestContentDto testContent = testService.getTestContent(id, user);
        return ResponseEntity.ok(testContent);
    }
}
