package ru.programschool.quizziz_clone.controller.list;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import ru.programschool.quizziz_clone.controller.BaseController;
import ru.programschool.quizziz_clone.exception.list.ResourceNotFoundException;
import ru.programschool.quizziz_clone.model.dto.jwt.LoginResponse;
import ru.programschool.quizziz_clone.model.dto.user.LoginRequest;
import ru.programschool.quizziz_clone.model.dto.user.RegisterRequest;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;
import ru.programschool.quizziz_clone.service.JwtUtils;
import ru.programschool.quizziz_clone.service.MailService;

import java.util.UUID;


@RestController
@RequestMapping("/api/auth")
@Tag(name = "Аутентификация", description = "Методы для регистрации, логина и подтверждения аккаунта")
public class AuthController extends BaseController {
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthController(UserRepository userRepository,
                          MailService mailService,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils,
                          AuthenticationManager authenticationManager) {

        super(userRepository);
        this.mailService = mailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    @Operation(summary = "Регистрация нового учителя", description = "Создает аккаунт в статусе ожидания и отправляет письмо админу")
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setConfirmationToken(UUID.randomUUID().toString());
        user.setEnabled(false);

        userRepository.save(user);

        mailService.sendConfirmationMail(user.getEmail(), user.getConfirmationToken());

        return ResponseEntity.ok("Заявка отправлена на рассмотрение администратору.");
    }

    @Operation(summary = "Подтверждение регистрации", description = "Метод для администратора (через ссылку из письма)")
    @GetMapping("/confirm")
    public ResponseEntity<String> confirm(@RequestParam String token) {
        User user = userRepository.findByConfirmationToken(token)
                .orElseThrow(() -> new RuntimeException("Токен не найден"));

        user.setEnabled(true);
        user.setConfirmationToken(null); // Очищаем токен после активации
        userRepository.save(user);

        return ResponseEntity.ok("Регистрация учителя " + user.getEmail() + " подтверждена.");
    }

    @Operation(summary = "Вход в систему", description = "Возвращает JWT токен при успешной авторизации")
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateToken(loginRequest.getEmail());

        return ResponseEntity.ok(getLoginResponse(loginRequest, jwt));
    }

    private LoginResponse getLoginResponse(LoginRequest loginRequest, String jwt) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь с email " + loginRequest.getEmail() + " не найден"));

        return LoginResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .token(jwt)
                .build();
    }
}
