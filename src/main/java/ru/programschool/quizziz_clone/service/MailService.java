package ru.programschool.quizziz_clone.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${app.cors.allowed-origins}")
    private String address;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.admin.email}")
    private String adminEmail;

    public void sendConfirmationMail(String teacherEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(adminEmail);
        message.setSubject("Запрос на регистрацию учителя");
        message.setText("Учитель " + teacherEmail + " хочет зарегистрироваться. \n" +
                "Подтвердить: " + address + "/auth/confirm?token=" + token);
        mailSender.send(message);
    }
}