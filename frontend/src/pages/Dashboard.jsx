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
    Plus,
    Settings2,
    Trash2,
    User,
    UserPlus,
    X,
    Play
} from 'lucide-react';
import {useLocation, useNavigate} from "react-router-dom";

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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-purple-900 text-white p-4 shadow-lg flex justify-between items-center">
                <div className="font-bold text-xl tracking-tight">Program<span className="text-yellow-400">School</span></div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-800/50 rounded-lg border border-purple-700/50">
                        <User size={16} className="text-yellow-400" />
                        <span className="text-sm font-medium">{username}</span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 hover:text-yellow-400 transition-colors text-sm font-semibold">
                        <LogOut size={18} /> Выйти
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
                {/* Хлебные крошки */}
                <div
                    className="flex items-center gap-2 mb-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <button onClick={() => {
                        setCurrentFolderId(null);
                        setCurrentPath([])
                    }} className="hover:text-purple-600 transition-colors"><Home size={16}/></button>
                    {currentPath.map((folder, i) => (
                        <div key={folder.id} className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-slate-300"/>
                            <button onClick={() => {
                                const newPath = currentPath.slice(0, i + 1);
                                setCurrentPath(newPath);
                                setCurrentFolderId(folder.id);
                            }} className="hover:text-purple-600 font-medium transition-colors">{folder.name}</button>
                        </div>
                    ))}
                </div>

                {/* Кнопки управления */}
                <div className="flex gap-4 mb-8 items-center">
                    <button
                        onClick={handleMoveUp}
                        disabled={currentFolderId === null}
                        className={`p-2 rounded-lg border transition-all ${currentFolderId === null ? 'text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed' : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-100 shadow-sm'}`}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Кнопка Папка */}
                    <button
                        onClick={() => {setNewName(''); setIsModalOpen(true)}}
                        disabled={!canEditCurrentFolder}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all text-sm font-bold ${
                            canEditCurrentFolder
                                ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {canEditCurrentFolder ? <FolderPlus size={18} /> : <Lock size={18} />} Папка
                    </button>

                    {/* Кнопка Тест */}
                    <button
                        onClick={() => {setNewName(''); setIsTestModalOpen(true)}}
                        disabled={!canEditCurrentFolder}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md transition-all text-sm ${
                            canEditCurrentFolder
                                ? 'bg-yellow-400 text-purple-900 hover:bg-yellow-500 active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {canEditCurrentFolder ? <Plus size={18} /> : <Lock size={18} />} Тест
                    </button>
                </div>

                {/* Сетка элементов */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elements.map((item) => (
                        <div key={item.id}
                             className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col group hover:shadow-md hover:border-purple-200 transition-all relative">

                            {!item.canEdit && (
                                <div
                                    className="absolute top-2 right-2 p-1.5 bg-slate-100/80 text-slate-400 rounded-full backdrop-blur-sm shadow-sm"
                                    title="Только чтение">
                                    <Lock size={12}/>
                                </div>
                            )}

                            <div className="flex items-center gap-3 cursor-pointer"
                                 onClick={() => item.type === 'DIRECTORY' ? (setCurrentFolderId(item.id), setCurrentPath([...currentPath, item])) : handleOpenPreview(item)}>
                                <div
                                    className={`p-2.5 rounded-lg ${item.type === 'DIRECTORY' ? 'bg-purple-50 text-purple-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                    {item.type === 'DIRECTORY' ? <Folder size={22}/> : <FileText size={22}/>}
                                </div>
                                <div className="truncate flex-1">
                                    <h3 className="font-bold text-slate-800 truncate text-sm leading-tight pr-6">{item.name}</h3>                                    {/* 1. Отображаем ИМЯ владельца, если вы не хозяин */}
                                    {!item.isOwner && (
                                        <div
                                            className="text-[10px] text-slate-400 mt-0.5 truncate font-medium flex items-center gap-1">
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
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenRoom(item.id); }}
                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Начать игру"
                                        >
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

                                    <button
                                        disabled={!item.canEdit}
                                        onClick={() => {
                                            setSelectedElement(item);
                                            setNewName(item.name);
                                            setIsEditModalOpen(true)
                                        }}
                                        className={`p-1.5 rounded-md transition-all ${item.canEdit ? 'text-slate-400 hover:text-purple-600 hover:bg-purple-50' : 'text-slate-200 cursor-not-allowed'}`}
                                    >
                                        <Edit2 size={16}/>
                                    </button>

                                    <button
                                        disabled={!item.canEdit}
                                        onClick={() => handleDelete(item.id)}
                                        className={`p-1.5 rounded-md transition-all ${item.canEdit ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-200 cursor-not-allowed'}`}
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* МОДАЛКА: ПРОСМОТР ТЕСТА */}
                {isPreviewModalOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in duration-150">
                            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-purple-900">{selectedElement?.name}</h2>
                                    {/* 2. Отображаем ИМЯ и EMAIL в модалке просмотра */}
                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                                        {!selectedElement?.isOwner && (
                                            <>
                                                <User
                                                    size={12}/> Владелец: {selectedElement?.ownerName} ({selectedElement?.ownerEmail})
                                            </>
                                        )}
                                        {!selectedElement?.canEdit && <span
                                            className="ml-2 text-red-400 font-bold uppercase text-[9px] bg-red-50 px-2 py-0.5 rounded">Только чтение</span>}
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
                                             className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                            <p className="font-bold text-slate-800 text-sm">{i + 1}. {q.questionText}</p>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {q.answers.map((a, j) => (
                                                    <div key={j}
                                                         className={`p-2.5 rounded-lg border text-xs ${a.isRight ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-white border-slate-100 text-slate-500 shadow-sm'}`}>
                                                        {a.answerText}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : <div className="text-center py-10 text-slate-400 animate-pulse text-sm">Загрузка
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
                                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all ${selectedElement?.canEdit ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed border'}`}
                                >
                                    {selectedElement?.canEdit ? <Settings2 size={16}/> : <Lock size={16}/>}
                                    {selectedElement?.canEdit ? "Редактировать" : "Только для чтения"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Остальные модалки (создание, переименование, шаринг) */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-purple-900 p-4 text-white font-bold flex justify-between items-center">
                                <span>Новая папка</span>
                                <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
                                <input autoFocus
                                       className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-purple-500 text-sm"
                                       placeholder="Название..." value={newName}
                                       onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit"
                                        className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-xl hover:bg-purple-700 transition-colors">Создать
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {isTestModalOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div
                                className="bg-yellow-400 p-4 text-purple-900 font-bold flex justify-between items-center">
                                <span>Новый тест</span>
                                <button onClick={() => setIsTestModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreateTest} className="p-6 space-y-4">
                                <input autoFocus
                                       className="w-full p-3 border-2 border-yellow-100 rounded-xl outline-none focus:border-purple-500 text-sm"
                                       placeholder="Название теста..." value={newName}
                                       onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit"
                                        className="w-full bg-purple-900 text-white font-bold py-2.5 rounded-xl transition-colors">Перейти
                                    к вопросам
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                            <div className="bg-slate-800 p-4 text-white font-bold flex justify-between items-center">
                                <span>Переименовать</span>
                                <button onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleRename} className="p-6 space-y-4">
                                <input autoFocus
                                       className="w-full p-3 border-2 rounded-xl outline-none focus:border-purple-500 text-sm"
                                       value={newName} onChange={(e) => setNewName(e.target.value)} required/>
                                <button type="submit"
                                        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl">Сохранить
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {isShareModalOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                            <div className="bg-purple-900 p-5 text-white flex justify-between items-center">
                                <div className="flex items-center gap-2"><UserPlus size={20}
                                                                                   className="text-yellow-400"/><h2
                                    className="text-lg font-bold">Доступ</h2></div>
                                <button onClick={() => setIsShareModalOpen(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleShare} className="p-6 space-y-5">
                                <input
                                    className="w-full p-3.5 border-2 border-slate-100 rounded-xl outline-none focus:border-purple-500 bg-slate-50 text-sm"
                                    type="email" placeholder="Email коллеги" value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)} required/>
                                <label
                                    className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                    <input type="checkbox" className="w-4 h-4 accent-purple-600" checked={canEdit}
                                           onChange={(e) => setCanEdit(e.target.checked)}/>
                                    <span className="text-slate-700 font-bold text-sm">Разрешить редактирование</span>
                                </label>
                                <button type="submit"
                                        className="w-full bg-yellow-400 text-purple-900 font-bold py-3.5 rounded-xl shadow-lg hover:bg-yellow-500 transition-all">ОТКРЫТЬ
                                    ДОСТУП
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