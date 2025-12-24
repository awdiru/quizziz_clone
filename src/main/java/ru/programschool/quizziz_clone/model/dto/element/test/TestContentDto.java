package ru.programschool.quizziz_clone.model.dto.element.test;

import lombok.Builder;
import lombok.Data;
import ru.programschool.quizziz_clone.model.dto.element.test.question.QuestionDto;
import java.util.List;

@Data
@Builder
public class TestContentDto {
    private Long id;
    private String name;
    private boolean canEdit;
    private List<QuestionDto> questions;
}