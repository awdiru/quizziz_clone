package ru.programschool.quizziz_clone.model.entity.postgrsql;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Entity
@Table(name = "answers")
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "answer")
    private String answer;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(name = "number")
    private int number;

    @Column(name = "is_right")
    private Boolean isRight;
}
