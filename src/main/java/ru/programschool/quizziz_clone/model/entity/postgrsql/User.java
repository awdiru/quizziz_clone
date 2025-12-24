package ru.programschool.quizziz_clone.model.entity.postgrsql;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private boolean enabled = false;

    private String confirmationToken;

    @Enumerated(EnumType.STRING)
    private Role role = Role.TEACHER;
}
