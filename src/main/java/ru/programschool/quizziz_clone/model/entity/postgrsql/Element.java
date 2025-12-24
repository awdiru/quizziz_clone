package ru.programschool.quizziz_clone.model.entity.postgrsql;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
@Entity
@Table(name = "elements",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"name", "parent_id", "type"})
        })
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING)
public abstract class Element {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @Column(name = "name")
    protected String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    protected Element parent;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", insertable=false, updatable=false)
    protected ElementType type;

    @Column(name = "created")
    protected LocalDateTime edited;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    protected User owner;

    @OneToMany(mappedBy = "element", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ElementPermission> permissions = new ArrayList<>();
}
