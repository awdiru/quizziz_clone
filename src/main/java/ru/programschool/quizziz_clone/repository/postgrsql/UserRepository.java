package ru.programschool.quizziz_clone.repository.postgrsql;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Найти пользователя по Email
     *
     * @param email email пользователя
     * @return найденный пользователь
     */
    Optional<User> findByEmail(String email);

    /**
     * Найти пользователя по токену подтверждения
     *
     * @param token токен подтверждения
     * @return найденный пользователь
     */
    Optional<User> findByConfirmationToken(String token);
}
