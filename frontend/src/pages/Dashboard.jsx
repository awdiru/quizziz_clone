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
                        /* Исправлено: добавил group сюда */
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
                                <div className="truncate flex-1">
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
                                    <p className="text-xs text-brand-gray font-medium flex items-center gap-1 mt-1">
                                        {!selectedElement?.isOwner && <><User size={12}/> Владелец: {selectedElement?.ownerName}</>}
                                        {!selectedElement?.canEdit && <span className="ml-2 text-brand-red font-bold uppercase text-[9px] bg-red-50 px-2 py-0.5 rounded">Только чтение</span>}
                                    </p>
                                </div>
                                <button onClick={() => { setIsPreviewModalOpen(false); setPreviewTest(null) }} className="modal-close-btn-dark"><X size={24}/></button>
                            </div>
                            <div className="preview-scroll-area">
                                {previewTest ? (
                                    previewTest.questions.map((q, i) => (
                                        <div key={i} className="preview-question-card">
                                            <p className="font-bold text-brand-dark text-sm">{i + 1}. {q.questionText}</p>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {q.answers.map((a, j) => (
                                                    <div key={j} className={`preview-answer-item ${a.isRight ? 'preview-answer-correct' : ''}`}>
                                                        {a.answerText}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : <div className="text-center py-10 text-brand-gray animate-pulse text-sm">Загрузка вопросов...</div>}
                            </div>
                            <div className="p-4 border-t bg-white flex justify-end">
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

                {/* Доступ */}
                {isShareModalOpen && (
                    <div className="modal-overlay z-[100]">
                        <div className="modal-content">
                            <div className="modal-header modal-header-purple">
                                <div className="flex items-center gap-2">
                                    <UserPlus size={20} className="text-brand-yellow"/>
                                    <h2 className="text-lg font-bold">Доступ</h2>
                                </div>
                                <button onClick={() => setIsShareModalOpen(false)} className="modal-close-btn"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleShare} className="modal-form">
                                <input className="modal-input" type="email" placeholder="Email коллеги" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} required/>
                                <label className="modal-checkbox-group">
                                    <input type="checkbox" className="w-4 h-4 accent-brand-purple" checked={canEdit} onChange={(e) => setCanEdit(e.target.checked)}/>
                                    <span className="text-brand-dark font-bold text-sm">Разрешить редактирование</span>
                                </label>
                                <button type="submit" className="btn-modal-yellow">ОТКРЫТЬ ДОСТУП</button>
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
                                <p className="text-xs text-brand-gray mb-1 px-1">Введите новое имя для копии:</p>
                                <input
                                    autoFocus
                                    className="modal-input"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn-modal-primary disabled:opacity-50 disabled:cursor-not-allowed"
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