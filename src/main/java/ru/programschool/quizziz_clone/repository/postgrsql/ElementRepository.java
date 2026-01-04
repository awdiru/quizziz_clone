package ru.programschool.quizziz_clone.repository.postgrsql;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.programschool.quizziz_clone.model.entity.postgrsql.Element;
import ru.programschool.quizziz_clone.model.entity.postgrsql.ElementType;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;

import java.util.List;

@Repository
public interface ElementRepository extends JpaRepository<Element, Long> {


    /**
     * Найти все элементы в папке, где пользователь либо владелец, либо имеет разрешение
     *
     * @param parentId идентификатор родительского элемента
     * @param user     пользователь
     * @return список элементов
     */
    @Query("""
                SELECT e FROM Element e
                LEFT JOIN e.permissions p
                WHERE e.parent.id = :parentId
                AND (e.owner = :user OR p.user = :user)
            """)
    List<Element> findAvailableElements(@Param("parentId") Long parentId, @Param("user") User user);

    /**
     * Найти все элементы в корневой директории, где пользователь либо владелец, либо имеет разрешение
     *
     * @param user пользователь
     * @return список элементов
     */
    @Query("""
                SELECT e FROM Element e
                LEFT JOIN e.permissions p
                WHERE (e.parent IS NULL AND e.owner = :user)
                OR (p.user = :user)
            """)
    List<Element> findAvailableRootElements(@Param("user") User user);

    /**
     * Возвращает список всех элементов по идентификатору родителя
     * @param parentId идентификатор родителя
     * @return список элементов
     */
    List<Element> findByParentId(Long parentId);

    /**
     * Проверка наличия в данной директории элемента с таким же именем и типом
     *
     * @param name   имя
     * @param parent данная директория
     * @param type   тип элемента
     * @return true - такой элемент существует, false - такого элемента нет
     */
    boolean existsByNameAndParentAndType(String name, Element parent, ElementType type);
}
