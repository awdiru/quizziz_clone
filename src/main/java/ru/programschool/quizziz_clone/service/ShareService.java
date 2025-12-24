package ru.programschool.quizziz_clone.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.programschool.quizziz_clone.model.entity.postgrsql.Element;
import ru.programschool.quizziz_clone.model.entity.postgrsql.ElementPermission;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.repository.postgrsql.ElementPermissionRepository;
import ru.programschool.quizziz_clone.repository.postgrsql.ElementRepository;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;

@Service
@RequiredArgsConstructor
public class ShareService {
    private final ElementRepository elementRepository;
    private final UserRepository userRepository;
    private final ElementPermissionRepository permissionRepository;
    private final ElementPermissionRepository elementPermissionRepository;

    @Transactional
    public void shareElement(Long elementId, String guestEmail, boolean canEdit, User owner) {
        Element element = elementRepository.findById(elementId)
                .orElseThrow(() -> new RuntimeException("Элемент не найден"));

        if (!element.getOwner().equals(owner)) {
            throw new RuntimeException("Только владелец может раздавать права");
        }

        User guest = userRepository.findByEmail(guestEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь с таким email не найден"));

        ElementPermission permission = elementPermissionRepository.findByElement_IdAndUser_Id(element.getId(), guest.getId())
                .orElse(
                        ElementPermission.builder()
                                .element(element)
                                .user(guest)
                                .build()
                );

        permission.setCanEdit(canEdit);

        permissionRepository.save(permission);
    }
}
