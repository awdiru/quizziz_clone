package ru.programschool.quizziz_clone.repository.postgrsql;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
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

    /**
     * Поиск пользователей по совпадению в имени или email
     *
     * @param query    строка для поиска
     * @param pageable количество ответов
     * @return Список совпадений
     */
    @Query("""
            SELECT u FROM User u WHERE
            (LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR
            LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))
            AND u.enabled = true
            """)
    List<User> searchUsers(@Param("query") String query, Pageable pageable);

    /**
     * Удаление всех аккаунтов пользователей, регистрацию которых не подтвердил администратор и дата регистрации которых ранее установленного времени
     *
     * @param dateTime установленное время
     */
    @Modifying
    @Transactional
    @Query("""
            DELETE FROM User u
            WHERE u.enabled = false
            AND (u.registerDate IS NULL
            OR u.registerDate < :dateTime)
            """)
    void deleteUnactivatedUsersOlderThan(@Param("dateTime") LocalDateTime dateTime);
}
