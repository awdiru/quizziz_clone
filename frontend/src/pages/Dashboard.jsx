import React, {useEffect, useState} from 'react';
import api from '../api/axios';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
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
                <div className="font-bold text-xl tracking-tight">Program<span
                    className="text-brand-yellow">School</span></div>
                <div className="flex items-center gap-6">
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-purple-light/30 rounded-btn border border-white/10">
                        <User size={16} className="text-brand-yellow"/>
                        <span className="text-sm font-medium">{username}</span>
                    </div>
                    <button onClick={handleLogout}
                            className="flex items-center gap-2 hover:text-brand-yellow transition-colors text-sm font-semibold">
                        <LogOut size={18} /> Выйти
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                {/* Хлебные крошки */}
                <div className="breadcrumb-container">
                    <button onClick={() => {
                        setCurrentFolderId(null);
                        setCurrentPath([])
                    }} className="breadcrumb-link">
                        <Home size={16}/>
                    </button>
                    {currentPath.map((folder, i) => (
                        <div key={folder.id} className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-slate-300"/>
                            <button onClick={() => {
                                const newPath = currentPath.slice(0, i + 1);
                                setCurrentPath(newPath);
                                setCurrentFolderId(folder.id);
                            }} className="breadcrumb-link font-medium">{folder.name}</button>
                        </div>
                    ))}
                </div>

                {/* Кнопки управления */}
                <div className="flex gap-4 mb-8 items-center">
                    <button onClick={handleMoveUp} disabled={currentFolderId === null} className="btn-icon-square">
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={() => {setNewName(''); setIsModalOpen(true)}}
                        disabled={!canEditCurrentFolder}
                        className={`btn-control-base ${canEditCurrentFolder ? 'btn-folder' : 'bg-slate-200 text-slate-400'}`}
                    >
                        {canEditCurrentFolder ? <FolderPlus size={18} /> : <Lock size={18} />} Папка
                    </button>

                    <button
                        onClick={() => {setNewName(''); setIsTestModalOpen(true)}}
                        disabled={!canEditCurrentFolder}
                        className={`btn-control-base ${canEditCurrentFolder ? 'btn-test' : 'bg-slate-100 text-slate-400'}`}
                    >
                        {canEditCurrentFolder ? <Plus size={18} /> : <Lock size={18} />} Тест
                    </button>
                </div>

                {/* Сетка элементов */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elements.map((item) => (
                        <div key={item.id} className="element-card group">
                            {!item.canEdit && (
                                <div
                                    className="absolute top-2 right-2 p-1.5 bg-brand-surface/80 text-slate-400 rounded-full backdrop-blur-sm shadow-sm"
                                    title="Только чтение">
                                    <Lock size={12}/>
                                </div>
                            )}

                            <div className="flex items-center gap-3 cursor-pointer"
                                 onClick={() => item.type === 'DIRECTORY' ? (setCurrentFolderId(item.id), setCurrentPath([...currentPath, item])) : handleOpenPreview(item)}>
                                <div
                                    className={`element-icon-wrapper ${item.type === 'DIRECTORY' ? 'icon-folder' : 'icon-test'}`}>
                                    {item.type === 'DIRECTORY' ? <Folder size={22}/> : <FileText size={22}/>}
                                </div>
                                <div className="truncate flex-1">
                                    <h3 className="font-bold text-brand-dark truncate text-sm leading-tight pr-6">{item.name}</h3>
                                    {!item.isOwner && (
                                        <div
                                            className="text-[10px] text-brand-gray mt-0.5 truncate font-medium flex items-center gap-1">
                                            <User size={10}/> {item.ownerName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                                <div
                                    className="flex items-center gap-1 text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                                    <Calendar size={10}/> {formatDate(item.edited)}
                                </div>

                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.type === 'TEST' && (
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenRoom(item.id);
                                        }}
                                                className="p-1.5 text-brand-green hover:bg-green-50 rounded-lg transition-colors"
                                                title="Начать игру">
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    )}
                                    <button
                                        disabled={!item.isOwner}
                                        onClick={() => {
                                            setSelectedElement(item);
                                            setShareEmail('');
                                            setCanEdit(false);
                                            setIsShareModalOpen(true)
                                        }}
                                        className={`p-1.5 rounded-md transition-all ${item.isOwner ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-200 cursor-not-allowed'}`}
                                        title={item.isOwner ? "Поделиться" : "Доступно только владельцу"}
                                    >
                                        <UserPlus size={16}/>
                                    </button>
                                    <button disabled={!item.canEdit} onClick={() => {
                                        setSelectedElement(item);
                                        setNewName(item.name);
                                        setIsEditModalOpen(true)
                                    }}
                                            className={`p-1.5 rounded-md transition-all ${item.canEdit ? 'text-slate-400 hover:text-brand-purple-light hover:bg-brand-purple-subtle' : 'text-slate-200 cursor-not-allowed'}`}
                                            title="Переименовать"
                                    >
                                        <Edit2 size={16}/>
                                    </button>
                                    <button disabled={!item.canEdit} onClick={() => handleDelete(item.id)}
                                            className={`p-1.5 rounded-md transition-all ${item.canEdit ? 'text-slate-400 hover:text-brand-red hover:bg-red-50' : 'text-slate-200 cursor-not-allowed'}`}
                                            title="Удалить"
                                    >
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
                        <div className="modal-content max-w-2xl max-h-[85vh] flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center bg-brand-surface">
                                <div>
                                    <h2 className="text-xl font-bold text-brand-purple">{selectedElement?.name}</h2>
                                    <p className="text-xs text-brand-gray font-medium flex items-center gap-1 mt-1">
                                        {!selectedElement?.isOwner && <><User
                                            size={12}/> Владелец: {selectedElement?.ownerName} ({selectedElement?.ownerEmail})</>}
                                        {!selectedElement?.canEdit && <span
                                            className="ml-2 text-brand-red font-bold uppercase text-[9px] bg-red-50 px-2 py-0.5 rounded">Только чтение</span>}
                                    </p>
                                </div>
                                <button onClick={() => {
                                    setIsPreviewModalOpen(false);
                                    setPreviewTest(null)
                                }} className="text-slate-300 hover:text-slate-600"><X size={24}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {previewTest ? (
                                    previewTest.questions.map((q, i) => (
                                        <div key={i}
                                             className="p-4 bg-brand-surface rounded-btn border border-slate-100 space-y-3">
                                            <p className="font-bold text-brand-dark text-sm">{i + 1}. {q.questionText}</p>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {q.answers.map((a, j) => (
                                                    <div key={j}
                                                         className={`p-2.5 rounded-lg border text-xs ${a.isRight ? 'bg-green-50 border-brand-green text-green-700 font-bold' : 'bg-white border-slate-100 text-brand-gray shadow-sm'}`}>
                                                        {a.answerText}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : <div className="text-center py-10 text-brand-gray animate-pulse text-sm">Загрузка
                                    вопросов...</div>}
                            </div>
                            <div className="p-4 border-t bg-white flex justify-end">
                                <button
                                    disabled={!selectedElement?.canEdit}
                                    onClick={() => navigate(`/editor/${selectedElement.id}`, {
                                        state: {
                                            returnFolderId: currentFolderId,
                                            returnPath: currentPath
                                        }
                                    })}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-btn font-bold text-sm transition-all ${selectedElement?.canEdit ? 'bg-brand-purple text-white shadow-md hover:bg-brand-purple-light' : 'bg-slate-100 text-slate-300 cursor-not-allowed border'}`}
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
                        <div className="modal-content max-w-sm">
                            <div className="modal-header bg-brand-purple">
                                <span>Новая папка</span>
                                <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
                                <input autoFocus className="modal-input" placeholder="Название..." value={newName}
                                       onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit" className="btn-modal-primary">Создать</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Создание теста */}
                {isTestModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content max-w-sm">
                            <div className="modal-header bg-brand-yellow text-brand-purple">
                                <span>Новый тест</span>
                                <button onClick={() => setIsTestModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreateTest} className="p-6 space-y-4">
                                <input autoFocus className="modal-input !border-yellow-100"
                                       placeholder="Название теста..." value={newName}
                                       onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit" className="btn-modal-primary">Перейти к вопросам</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Переименование */}
                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content max-w-sm">
                            <div className="modal-header bg-slate-800">
                                <span>Переименовать</span>
                                <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleRename} className="p-6 space-y-4">
                                <input autoFocus className="modal-input" value={newName}
                                       onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit" className="btn-modal-primary !bg-blue-600">Сохранить</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Доступ */}
                {isShareModalOpen && (
                    <div className="modal-overlay z-[100]">
                        <div className="modal-content max-w-md">
                            <div className="modal-header bg-brand-purple">
                                <div className="flex items-center gap-2"><UserPlus size={20}
                                                                                   className="text-brand-yellow"/><h2
                                    className="text-lg font-bold">Доступ</h2></div>
                                <button onClick={() => setIsShareModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleShare} className="p-6 space-y-5">
                                <input className="modal-input" type="email" placeholder="Email коллеги"
                                       value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} required/>
                                <label
                                    className="flex items-center gap-3 p-3.5 bg-brand-surface rounded-btn cursor-pointer hover:bg-slate-100 transition-colors">
                                    <input type="checkbox" className="w-4 h-4 accent-brand-purple" checked={canEdit}
                                           onChange={(e) => setCanEdit(e.target.checked)}/>
                                    <span className="text-brand-dark font-bold text-sm">Разрешить редактирование</span>
                                </label>
                                <button type="submit" className="btn-modal-yellow">ОТКРЫТЬ ДОСТУП</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;