import React, {useEffect, useState} from 'react';
import api from '../api/axios';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Copy,
    Edit2,
    FileText,
    Folder,
    FolderPlus,
    Home,
    Lock,
    LogOut,
    Play,
    Plus,
    Settings2,
    Trash2,
    User,
    UserPlus,
    X
} from 'lucide-react';
import {useLocation, useNavigate} from "react-router-dom";
import '../styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const username = localStorage.getItem('username') || 'Пользователь';

    // Состояния навигации и данных
    const [currentFolderId, setCurrentFolderId] = useState(location.state?.folderId || null);
    const [elements, setElements] = useState([]);
    const [currentPath, setCurrentPath] = useState(location.state?.path || []);

    // Состояния модальных окон
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

    // Данные для форм
    const [newName, setNewName] = useState('');
    const [shareEmail, setShareEmail] = useState('');
    const [canEdit, setCanEdit] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const [previewTest, setPreviewTest] = useState(null);

    const canEditCurrentFolder = currentFolderId === null || (currentPath.length > 0 && currentPath[currentPath.length - 1].canEdit);

    //Управление результатами поиска и процессом загрузки
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (location.state?.folderId !== undefined) setCurrentFolderId(location.state.folderId);
        if (location.state?.path) setCurrentPath(location.state.path);
    }, [location.state]);

    const fetchElements = async (folderId) => {
        try {
            const url = folderId ? `/fs/list?parentId=${folderId}` : '/fs/list';
            const response = await api.get(url);

            const sortedData = response.data.sort((a, b) => {
                if (a.type !== b.type) return a.type === 'DIRECTORY' ? -1 : 1;
                return a.name.localeCompare(b.name);
            });

            setElements(sortedData);
        } catch (err) {
            console.error("Ошибка при загрузке элементов:", err);
        }
    };

    useEffect(() => {
        fetchElements(currentFolderId);
    }, [currentFolderId]);

    useEffect(() => {
        // Если поле пустое, очищаем список
        if (shareEmail.length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        // Устанавливаем таймер на 800мс (или 1 секунду, как вы просили)
        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await api.get(`/user/search`, {
                    params: { query: shareEmail }
                });
                setSearchResults(response.data);
                setShowDropdown(response.data.length > 0);
            } catch (err) {
                console.error("Ошибка при поиске пользователей:", err);
            } finally {
                setIsSearching(false);
            }
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [shareEmail]);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        try {
            await api.post('/fs/directory', null, {params: {name: newName, parentId: currentFolderId}});
            setIsModalOpen(false);
            setNewName('');
            fetchElements(currentFolderId);
        } catch (err) {
            alert("Ошибка при создании папки");
        }
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/fs/test', null, {params: {name: newName, parentId: currentFolderId}});
            setIsTestModalOpen(false);
            setNewName('');
            navigate(`/editor/${response.data.id}`, {
                state: {returnFolderId: currentFolderId, returnPath: currentPath}
            });
        } catch (err) {
            alert("Ошибка при создании теста");
        }
    };

    const handleRename = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/fs/${selectedElement.id}/rename`, null, {params: {newName: newName}});
            setIsEditModalOpen(false);
            setNewName('');
            fetchElements(currentFolderId);
        } catch (err) {
            alert("Ошибка при переименовании");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Вы уверены?")) return;
        try {
            await api.delete(`/fs/${id}`);
            fetchElements(currentFolderId);
        } catch (err) {
            alert("Недостаточно прав для удаления");
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/fs/${selectedElement.id}/share`, null, {
                params: {guestEmail: shareEmail, canEdit: canEdit}
            });
            alert(`Доступ предоставлен ${shareEmail}`);
            setIsShareModalOpen(false);
            setShareEmail('');
        } catch (err) {
            alert("Ошибка при предоставлении доступа");
        }
    };

    const handleOpenPreview = async (test) => {
        setSelectedElement(test);
        setIsPreviewModalOpen(true);
        try {
            const response = await api.get(`/tests/${test.id}/content`);
            setPreviewTest(response.data);
        } catch (err) {
            console.error("Ошибка загрузки содержимого");
        }
    };

    const handleCopy = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/fs/${selectedElement.id}/copy`, null, {
                params: { name: newName }
            });
            setIsCopyModalOpen(false);
            setNewName('');
            fetchElements(currentFolderId);
        } catch (err) {
            alert("Ошибка при копировании элемента");
        }
    };

    const handleMoveUp = () => {
        const newPath = [...currentPath];
        newPath.pop();
        const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
        setCurrentFolderId(parentId);
        setCurrentPath(newPath);
    };

    const handleOpenRoom = async (testId) => {
        try {
            const response = await api.post(`/rooms/open/${testId}`);
            const roomData = response.data; // Получаем PIN комнаты
            navigate(`/arena/teacher/${roomData.id}`, { state: { testId } });
        } catch (err) {
            console.error(err);
            alert("Не удалось открыть комнату для теста");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-logo">
                    Program<span className="text-brand-yellow">School</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="header-user-badge">
                        <User size={16} className="text-brand-yellow"/>
                        <span className="header-username">{username}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-logout-link">
                        <LogOut size={18} /> Выйти
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                {/* Хлебные крошки */}
                <div className="breadcrumb-container">
                    <button onClick={() => { setCurrentFolderId(null); setCurrentPath([]) }} className="breadcrumb-link">
                        <Home size={16}/>
                    </button>
                    {currentPath.map((folder, i) => (
                        <div key={folder.id} className="flex items-center gap-2">
                            <ChevronRight size={14} className="breadcrumb-separator"/>
                            <button onClick={() => {
                                const newPath = currentPath.slice(0, i + 1);
                                setCurrentPath(newPath);
                                setCurrentFolderId(folder.id);
                            }} className="breadcrumb-link font-medium">{folder.name}</button>
                        </div>
                    ))}
                </div>

                {/* Кнопки управления */}
                <div className="controls-panel">
                    <button onClick={handleMoveUp} disabled={currentFolderId === null} className="btn-icon-square">
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={() => {setNewName(''); setIsModalOpen(true)}}
                        disabled={!canEditCurrentFolder}
                        className={`btn-control-base ${canEditCurrentFolder ? 'btn-folder' : ''}`}
                    >
                        {canEditCurrentFolder ? <FolderPlus size={18} /> : <Lock size={18} />} Папка
                    </button>

                    <button
                        onClick={() => {setNewName(''); setIsTestModalOpen(true)}}
                        disabled={!canEditCurrentFolder}
                        className={`btn-control-base ${canEditCurrentFolder ? 'btn-test' : ''}`}
                    >
                        {canEditCurrentFolder ? <Plus size={18} /> : <Lock size={18} />} Тест
                    </button>
                </div>

                {/* Сетка элементов */}
                <div className="elements-grid">
                    {elements.map((item) => (
                        <div key={item.id} className="element-card group">
                            {!item.canEdit && (
                                <div className="lock-badge" title="Только чтение">
                                    <Lock size={12}/>
                                </div>
                            )}

                            <div className="element-main-info"
                                 onClick={() => item.type === 'DIRECTORY' ? (setCurrentFolderId(item.id), setCurrentPath([...currentPath, item])) : handleOpenPreview(item)}>
                                <div className={`element-icon-wrapper ${item.type === 'DIRECTORY' ? 'icon-folder' : 'icon-test'}`}>
                                    {item.type === 'DIRECTORY' ? <Folder size={22}/> : <FileText size={22}/>}
                                </div>
                                <div className="element-text-content">
                                    <h3 className="element-title">{item.name}</h3>
                                    {!item.isOwner && (
                                        <div className="element-owner-info">
                                            <User size={10}/> {item.ownerName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="element-footer">
                                <div className="element-date">
                                    <Calendar size={10}/> {formatDate(item.edited)}
                                </div>

                                <div className="element-actions">
                                    {item.type === 'TEST' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenRoom(item.id); }}
                                                className="btn-action btn-action-play" title="Начать игру">
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    )}
                                    <button
                                        disabled={!item.isOwner}
                                        onClick={() => { setSelectedElement(item); setShareEmail(''); setCanEdit(false); setIsShareModalOpen(true) }}
                                        className="btn-action btn-action-share"
                                        title={item.isOwner ? "Поделиться" : "Доступно только владельцу"}
                                    >
                                        <UserPlus size={16}/>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedElement(item);
                                            setNewName(item.name);
                                            setIsCopyModalOpen(true);
                                        }}
                                        className="btn-action btn-action-copy"
                                        title="Копировать"
                                    >
                                        <Copy size={16}/>
                                    </button>
                                    <button disabled={!item.canEdit} onClick={() => { setSelectedElement(item); setNewName(item.name); setIsEditModalOpen(true) }}
                                            className="btn-action btn-action-edit" title="Переименовать">
                                        <Edit2 size={16}/>
                                    </button>
                                    <button disabled={!item.canEdit} onClick={() => handleDelete(item.id)}
                                            className="btn-action btn-action-delete" title="Удалить">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ПРОСМОТР ТЕСТА */}
                {isPreviewModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-content-wide">
                            <div className="modal-header modal-header-preview">
                                <div>
                                    <h2 className="text-xl font-bold text-brand-purple">{selectedElement?.name}</h2>
                                    <div className="mt-1 flex items-center">
                                        {!selectedElement?.isOwner && (
                                            <span className="badge-owner">
                                                <User size={12}/> Владелец: {selectedElement?.ownerName}
                                            </span>
                                        )}
                                        {!selectedElement?.canEdit && <span className="badge-readonly">Только чтение</span>}
                                    </div>
                                </div>
                                <button onClick={() => { setIsPreviewModalOpen(false); setPreviewTest(null) }} className="modal-close-btn-dark"><X size={24}/></button>
                            </div>
                            <div className="preview-scroll-area">
                                {previewTest ? (
                                    previewTest.questions.map((q, i) => (
                                        <div key={i} className="preview-question-card">
                                            <p className="preview-question-text">{i + 1}. {q.questionText}</p>
                                            <div className="preview-answers-grid">
                                                {q.answers.map((a, j) => (
                                                    <div key={j} className={`preview-answer-item ${a.isRight ? 'preview-answer-correct' : ''}`}>
                                                        {a.answerText}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="preview-loading">
                                        <div className="spinner-brand"></div>
                                        <span className="text-xs font-bold">Загрузка вопросов...</span>
                                    </div>
                                )}
                            </div>
                            <div className="preview-footer">
                                <button
                                    disabled={!selectedElement?.canEdit}
                                    onClick={() => navigate(`/editor/${selectedElement.id}`, { state: { returnFolderId: currentFolderId, returnPath: currentPath } })}
                                    className={`btn-control-base ${selectedElement?.canEdit ? 'btn-folder' : ''}`}
                                >
                                    {selectedElement?.canEdit ? <Settings2 size={16}/> : <Lock size={16}/>}
                                    {selectedElement?.canEdit ? "Редактировать" : "Только для чтения"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Создание папки */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-content-narrow">
                            <div className="modal-header modal-header-purple">
                                <span>Новая папка</span>
                                <button onClick={() => setIsModalOpen(false)} className="modal-close-btn"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreateFolder} className="modal-form">
                                <input autoFocus className="modal-input" placeholder="Название..." value={newName} onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit" className="btn-modal-primary">Создать</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Создание теста */}
                {isTestModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-content-narrow">
                            <div className="modal-header modal-header-yellow">
                                <span>Новый тест</span>
                                <button onClick={() => setIsTestModalOpen(false)} className="modal-close-btn"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreateTest} className="modal-form">
                                <input autoFocus className="modal-input" placeholder="Название теста..." value={newName} onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit" className="btn-modal-primary">Перейти к вопросам</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Переименование */}
                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-content-narrow">
                            <div className="modal-header modal-header-dark">
                                <span>Переименовать</span>
                                <button onClick={() => setIsEditModalOpen(false)} className="modal-close-btn"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleRename} className="modal-form">
                                <input autoFocus className="modal-input" value={newName} onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit" className="btn-modal-primary">Сохранить</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Доступ (Share) */}
                {isShareModalOpen && (
                    <div className="modal-overlay modal-overlay-high-z">
                        <div className="modal-content modal-content-visible">
                            <div className="modal-header modal-header-purple modal-header-rounded-fix">
                                <div className="flex items-center gap-2">
                                    <UserPlus size={20} className="text-brand-yellow"/>
                                    <h2 className="text-lg font-bold uppercase tracking-tight">Доступ</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsShareModalOpen(false);
                                        setSearchResults([]);
                                        setShowDropdown(false);
                                    }}
                                    className="modal-close-btn"
                                >
                                    <X size={20}/>
                                </button>
                            </div>

                            <form onSubmit={handleShare} className="modal-form">
                                <div className="search-container">
                                    <input
                                        className="modal-input"
                                        type="text"
                                        placeholder="Имя или email коллеги..."
                                        value={shareEmail}
                                        onChange={(e) => setShareEmail(e.target.value)}
                                        autoComplete="off"
                                        required
                                    />

                                    {isSearching && (
                                        <div className="search-loader">
                                            <div className="spinner-brand"></div>
                                        </div>
                                    )}

                                    {showDropdown && (
                                        <div className="search-dropdown">
                                            {searchResults.map((user, idx) => (
                                                <div
                                                    key={idx}
                                                    className="search-result-item"
                                                    onClick={() => {
                                                        setShareEmail(user.email);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    <span className="search-result-name">{user.username}</span>
                                                    <span className="search-result-email">{user.email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <label className="modal-checkbox-group">
                                    <input
                                        type="checkbox"
                                        className="checkbox-brand"
                                        checked={canEdit}
                                        onChange={(e) => setCanEdit(e.target.checked)}
                                    />
                                    <span className="text-brand-dark font-bold text-sm">Разрешить редактирование</span>
                                </label>

                                <button type="submit" className="btn-modal-yellow">
                                    ОТКРЫТЬ ДОСТУП
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Копирование */}
                {isCopyModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-content-narrow">
                            <div className="modal-header modal-header-purple">
                                <span>Копировать элемент</span>
                                <button onClick={() => setIsCopyModalOpen(false)} className="modal-close-btn"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCopy} className="modal-form">
                                <p className="text-xs text-brand-gray mb-1 px-1 font-bold">Введите новое имя для копии:</p>
                                <input
                                    autoFocus
                                    className="modal-input"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn-modal-primary"
                                >
                                    Копировать
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;