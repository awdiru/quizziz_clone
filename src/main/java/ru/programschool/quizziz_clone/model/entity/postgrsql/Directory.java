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
@DiscriminatorValue("DIRECTORY")
public class Directory extends Element {
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<Element> children = new ArrayList<>();

    @Override
    public Directory copy(User user, String newName, Element parent) {
        Directory directory = new Directory();
        directory.setName(newName);
        directory.setParent(parent);
        directory.setType(getType());
        directory.setChildren(getChildren().stream().map(e -> e.copy(user, e.getName(), directory)).toList());
        directory.setEdited(LocalDateTime.now());
        directory.setOwner(user);
        return directory;
    }
}
