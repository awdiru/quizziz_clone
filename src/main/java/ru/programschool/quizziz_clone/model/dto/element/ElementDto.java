package ru.programschool.quizziz_clone.model.dto.element;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ElementDto {
    private Long id;
    private String name;
    private Long parentId;
    private String type;
    private String ownerName;
    private String ownerEmail;
    private LocalDateTime edited;
    private Boolean isOwner;
    private boolean canEdit;
}
