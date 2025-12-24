package ru.programschool.quizziz_clone.repository.postgrsql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.programschool.quizziz_clone.model.entity.postgrsql.ElementPermission;

import java.util.Optional;

@Repository
public interface ElementPermissionRepository extends JpaRepository<ElementPermission, Long> {
    Optional<ElementPermission> findByElement_IdAndUser_Id(Long elementId, Long userId);
}
