package ru.programschool.quizziz_clone.controller.list;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.programschool.quizziz_clone.controller.BaseController;
import ru.programschool.quizziz_clone.model.dto.user.UserSearchDto;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;
import ru.programschool.quizziz_clone.service.UserService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@Tag(name = "Пользователи", description = "Управление пользователями")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController extends BaseController {
    private final UserService userService;

    @Autowired
    public UserController(UserRepository userRepository, UserService userService) {
        super(userRepository);
        this.userService = userService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String query, Principal principal) {
        User user = getUserFromPrincipal(principal);
        List<UserSearchDto> users = userService.search(query, user);
        return ResponseEntity.ok(users);
    }
}
