package ru.programschool.quizziz_clone.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.programschool.quizziz_clone.exception.list.AccessDeniedException;
import ru.programschool.quizziz_clone.exception.list.ResourceNotFoundException;
import ru.programschool.quizziz_clone.model.dto.element.ElementDto;
import ru.programschool.quizziz_clone.model.entity.postgrsql.*;
import ru.programschool.quizziz_clone.repository.postgrsql.ElementRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FileSystemService {
    private final ElementRepository elementRepository;

    @Transactional
    public ElementDto createDirectory(String name, Long parentId, User owner) {
        Element parent = parentId != null ? getElementWithPermissionCheck(parentId, owner, true) : null;

        Directory dir = Directory.builder()
                .name(name)
                .parent(parent)
                .owner(owner)
                .edited(LocalDateTime.now())
                .type(ElementType.DIRECTORY)
                .build();

        return toDto(elementRepository.save(dir), owner);
    }

    @Transactional
    public ElementDto createTest(String name, Long parentId, User owner) {
        Element parent = parentId != null ? getElementWithPermissionCheck(parentId, owner, true) : null;

        Test test = Test.builder()
                .name(name)
                .parent(parent)
                .owner(owner)
                .edited(LocalDateTime.now())
                .type(ElementType.FILE)
                .build();

        return toDto(elementRepository.save(test), owner);
    }

    @Transactional
    public void renameElement(Long id, String newName, User owner) {
        Element element = getElementWithPermissionCheck(id, owner, true);
        element.setName(newName);
        element.setEdited(LocalDateTime.now());
        elementRepository.save(element);
    }

    @Transactional
    public void deleteElement(Long id, User owner) {
        Element element = getElementWithPermissionCheck(id, owner, true);
        elementRepository.delete(element);
    }

    public List<ElementDto> getDirectoryContent(Long parentId, User user) {
        List<Element> elements;
        if (parentId == null) {
            elements = elementRepository.findAvailableRootElements(user);
        } else {
            getElementWithPermissionCheck(parentId, user, false);
            elements = elementRepository.findByParentId(parentId);
        }

        return elements.stream()
                .map(e -> toDto(e, user))
                .toList();
    }

    /**
     * Универсальная проверка прав доступа
     *
     * @param element       проверяемый элемент
     * @param user          пользователь
     * @param writeRequired true - если проверяются права на запись, false - если на чтение
     * @return наличие доступа
     */
    public boolean hasAccess(Element element, User user, boolean writeRequired) {
        if (element.getOwner().getId().equals(user.getId())) return true;

        boolean directAccess = element.getPermissions().stream()
                .anyMatch(p -> p.getUser().getId().equals(user.getId()) && (!writeRequired || p.isCanEdit()));

        if (directAccess) return true;

        if (element.getParent() != null) {
            if (element.getParent().getOwner().getId().equals(user.getId()))
                return true;
            return hasAccess(element.getParent(), user, writeRequired);
        }

        return false;
    }

    private Element getElementWithPermissionCheck(Long id, User user, boolean writeRequired) {
        Element element = elementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Элемент с ID " + id + " не найден"));

        if (hasAccess(element, user, writeRequired)) return element;

        throw new AccessDeniedException("У вас нет прав доступа к этому элементу");
    }

    public ElementDto toDto(Element element, User currentUser) {
        return ElementDto.builder()
                .id(element.getId())
                .name(element.getName())
                .parentId(element.getParent() != null ? element.getParent().getId() : null)
                .type(element instanceof Directory ? "DIRECTORY" : "TEST")
                .ownerName(element.getOwner().getUsername())
                .ownerEmail(element.getOwner().getEmail())
                .edited(element.getEdited())
                .canEdit(hasAccess(element, currentUser, true))
                .isOwner(element.getOwner().getId().equals(currentUser.getId()))
                .build();
    }
}
