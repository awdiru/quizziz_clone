package ru.programschool.quizziz_clone.controller.list;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.programschool.quizziz_clone.controller.BaseController;
import ru.programschool.quizziz_clone.model.entity.postgrsql.User;
import ru.programschool.quizziz_clone.repository.postgrsql.UserRepository;
import ru.programschool.quizziz_clone.service.FileSystemService;
import ru.programschool.quizziz_clone.service.ShareService;

import java.security.Principal;

@RestController
@RequestMapping("/api/fs")
@Tag(name = "Файловая система", description = "Управление папками, тестами и правами доступа")
@SecurityRequirement(name = "Bearer Authentication")
public class FileSystemController extends BaseController {
    private final FileSystemService fileSystemService;
    private final ShareService shareService;

    @Autowired
    public FileSystemController(UserRepository userRepository,
                                FileSystemService fileSystemService,
                                ShareService shareService) {
        super(userRepository);
        this.fileSystemService = fileSystemService;
        this.shareService = shareService;
    }

    @Operation(summary = "Список элементов", description = "Получение списка файлов и папок в директории (или в корне, если parentId пустой)")
    @GetMapping("/list")
    public ResponseEntity<?> listContent(@RequestParam(required = false) Long parentId,
                                         Principal principal) {

        User user = getUserFromPrincipal(principal);
        return ResponseEntity.ok(fileSystemService.getDirectoryContent(parentId, user));
    }

    @Operation(summary = "Создать папку")
    @PostMapping("/directory")
    public ResponseEntity<?> createDir(@RequestParam String name,
                                       @RequestParam(required = false) Long parentId,
                                       Principal principal) {

        User owner = userRepository.findByEmail(principal.getName()).get();
        return ResponseEntity.ok(fileSystemService.createDirectory(name, parentId, owner));
    }

    @Operation(summary = "Создать пустой тест", description = "Создает пустой элемент типа FILE для последующего его заполнения")
    @PostMapping("/test")
    public ResponseEntity<?> createTest(@RequestParam String name,
                                        @RequestParam(required = false) Long parentId,
                                        Principal principal) {

        User owner = getUserFromPrincipal(principal);
        return ResponseEntity.ok(fileSystemService.createTest(name, parentId, owner));
    }

    @Operation(summary = "Поделиться элементом", description = "Предоставление доступа другому пользователю по email")
    @PostMapping("/{id}/share")
    public ResponseEntity<?> shareElement(@PathVariable Long id,
                                          @RequestParam String guestEmail,
                                          @RequestParam(defaultValue = "false") boolean canEdit,
                                          Principal principal) {

        User owner = userRepository.findByEmail(principal.getName()).get();
        shareService.shareElement(id, guestEmail, canEdit, owner);
        return ResponseEntity.ok("Доступ успешно предоставлен пользователю " + guestEmail);
    }

    @Operation(summary = "Переименовать элемент", description = "Переименовывает папку или тест (требуются права владельца)")
    @PatchMapping("/{id}/rename")
    public ResponseEntity<?> rename(@PathVariable Long id,
                                    @RequestParam String newName,
                                    Principal principal) {

        User user = getUserFromPrincipal(principal);
        fileSystemService.renameElement(id, newName, user);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Удалить элемент", description = "Удаляет папку или тест (требуются права владельца)")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    Principal principal) {

        User user = getUserFromPrincipal(principal);
        fileSystemService.deleteElement(id, user);
        return ResponseEntity.ok().build();
    }
}
