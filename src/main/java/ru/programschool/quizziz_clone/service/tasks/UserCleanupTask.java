package ru.programschool.quizziz_clone.service.tasks;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UserCleanupTask {
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupUnactivatedUsers() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(1);
        userRepository.deleteUnactivatedUsersOlderThan(cutoff);
    }
}
