package ru.programschool.quizziz_clone.model.entity.postgrsql;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
@ToString
@Entity
@DiscriminatorValue("FILE")
public class Test extends Element {
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private List<Question> questions = new ArrayList<>();

    @Override
    public Test copy(User user, String newName, Element parent) {
        Test test = new Test();
        test.setName(newName);
        test.setParent(parent);
        test.setType(getType());
        test.setQuestions(getQuestions().stream().map(q -> q.copy(test)).toList());
        test.setEdited(LocalDateTime.now());
        test.setOwner(user);
        return test;
    }
}
