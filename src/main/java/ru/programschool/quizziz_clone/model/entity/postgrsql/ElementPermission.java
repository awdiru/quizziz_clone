package ru.programschool.quizziz_clone.model.entity.postgrsql;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "element_permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElementPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "element_id")
    private Element element;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private boolean canEdit; // true - может менять, false - только просмотр/запуск
}
