import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import { getUser } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboardPage() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);
const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [dashboard, setDashboard] = useState({
    bookingsCount: 0,
    totalSales: 0,
    incomingBookings: [],
  });

  const [formSalon, setFormSalon] = useState({
    name: "",
    description: "",
    address: "",
    image: null,
  });

  const [formService, setFormService] = useState({
    salonId: "",
    name: "",
    description: "",
    price: "",
    durationMin: "",
  });

  const [formProduct, setFormProduct] = useState({
    salonId: "",
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [ownerSalons, setOwnerSalons] = useState([]);

  const [editingSalonId, setEditingSalonId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSpecialistModalOpen, setIsSpecialistModalOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState(null);
  const [isSpecialistServiceModalOpen, setIsSpecialistServiceModalOpen] = useState(false);
  const [selectedSpecialistForService, setSelectedSpecialistForService] = useState(null);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [selectedWorkImage, setSelectedWorkImage] = useState(null);
  const [selectedWorkCaption, setSelectedWorkCaption] = useState("");

  const [editSalonForm, setEditSalonForm] = useState({
    name: "",
    description: "",
    address: "",
    image: null,
  });

  const [editServiceForm, setEditServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMin: "",
  });

  const [editProductForm, setEditProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: "",
    id: null,
    title: "",
    message: "",
  });

  const [formSpecialist, setFormSpecialist] = useState({
  salonId: "",
  fullName: "",
  title: "",
  bio: "",
  photo: null,
  workStartTime: "09:00",
  workEndTime: "18:00",
  workDays: "1,2,3,4,5,6",
});

const [editingSpecialistId, setEditingSpecialistId] = useState(null);

const [editformSpecialist, setEditformSpecialist] = useState({
  fullName: "",
  title: "",
  bio: "",
  photo: null,
  workStartTime: "09:00",
  workEndTime: "18:00",
  workDays: "1,2,3,4,5,6",
});

const [formWork, setFormWork] = useState({
  specialistId: "",
  caption: "",
  image: null,
});
const [selectedSpecialistPhoto, setSelectedSpecialistPhoto] = useState(null);

const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  function handleScroll() {
    setIsScrolled(window.scrollY > 120);
  }

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

const [formSpecialistService, setFormSpecialistService] = useState({
  specialistId: "",
  serviceId: "",
});

  useEffect(() => {
  loadDashboard();
  loadOwnerSalons();
  loadOwnerChats();
}, []);
const navigate = useNavigate();

  async function loadDashboard() {
    try {
      const res = await api.get("/owner/dashboard");
      setDashboard(res.data);
    } catch (error) {
      console.error("Ошибка загрузки dashboard:", error);
      toast.error("Не удалось загрузить dashboard");
    }
  }

  async function loadOwnerSalons() {
    try {
      const salonsRes = await api.get("/salons");
      const mySalons = (salonsRes.data || []).filter((salon) => salon.ownerId === user.id);
      setOwnerSalons(mySalons);
    } catch (error) {
      console.error("Ошибка загрузки салонов владельца:", error);
      toast.error("Не удалось загрузить салоны");
    }
  }

  function handleSalonChange(e) {
    setFormSalon({ ...formSalon, [e.target.name]: e.target.value });
  }

  function handleServiceChange(e) {
    setFormService({ ...formService, [e.target.name]: e.target.value });
  }

  function handleProductChange(e) {
    setFormProduct({ ...formProduct, [e.target.name]: e.target.value });
  }

  async function createSalon(e) {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", formSalon.name);
      formData.append("description", formSalon.description);
      formData.append("address", formSalon.address);

      if (formSalon.image) {
        formData.append("image", formSalon.image);
      }

      await api.post("/owner/salons", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Салон создан");
      setFormSalon({
        name: "",
        description: "",
        address: "",
        image: null,
      });
      loadDashboard();
      loadOwnerSalons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка создания салона");
    }
  }

  async function createService(e) {
    e.preventDefault();

    try {
      await api.post("/owner/services", {
        ...formService,
        salonId: Number(formService.salonId),
        price: Number(formService.price),
        durationMin: Number(formService.durationMin),
      });

      toast.success("Услуга добавлена");
      setIsServiceModalOpen(false);
      setFormService({
        salonId: "",
        name: "",
        description: "",
        price: "",
        durationMin: "",
      });
      loadDashboard();
      loadOwnerSalons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка добавления услуги");
    }
  }

  async function createProduct(e) {
    e.preventDefault();

    try {
      await api.post("/owner/products", {
        ...formProduct,
        salonId: Number(formProduct.salonId),
        price: Number(formProduct.price),
        stock: Number(formProduct.stock),
      });

      toast.success("Товар добавлен");
      setIsProductModalOpen(false);
      setFormProduct({
        salonId: "",
        name: "",
        description: "",
        price: "",
        stock: "",
      });
      loadDashboard();
      loadOwnerSalons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка добавления товара");
    }
  }

  async function updateBookingStatus(bookingId, status) {
    try {
      await api.patch(`/owner/bookings/${bookingId}/status`, { status });
      toast.success("Статус обновлен");
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка обновления статуса");
    }
  }

  function startEditSalon(salon) {
    setEditingSalonId(salon.id);
    setEditSalonForm({
      name: salon.name,
      description: salon.description || "",
      address: salon.address || "",
      image: null,
    });
  }

  async function saveSalonEdit(salonId) {
    try {
      const formData = new FormData();
      formData.append("name", editSalonForm.name);
      formData.append("description", editSalonForm.description);
      formData.append("address", editSalonForm.address);

      if (editSalonForm.image) {
        formData.append("image", editSalonForm.image);
      }

      await api.patch(`/owner/salons/${salonId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Салон обновлен");
      setEditingSalonId(null);
      loadOwnerSalons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка обновления салона");
    }
  }

  function startEditService(service) {
    setEditingServiceId(service.id);
    setEditServiceForm({
      name: service.name,
      description: service.description || "",
      price: service.price,
      durationMin: service.durationMin,
    });
  }

  function startEditProduct(product) {
    setEditingProductId(product.id);
    setEditProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
    });
  }

  async function saveServiceEdit(serviceId) {
    try {
      await api.patch(`/owner/services/${serviceId}`, {
        ...editServiceForm,
        price: Number(editServiceForm.price),
        durationMin: Number(editServiceForm.durationMin),
      });

      toast.success("Услуга обновлена");
      setEditingServiceId(null);
      loadOwnerSalons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка обновления услуги");
    }
  }

  async function saveProductEdit(productId) {
    try {
      await api.patch(`/owner/products/${productId}`, {
        ...editProductForm,
        price: Number(editProductForm.price),
        stock: Number(editProductForm.stock),
      });

      toast.success("Товар обновлен");
      setEditingProductId(null);
      loadOwnerSalons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка обновления товара");
    }
  }

  function openDeleteModal(type, id) {
    const config = {
      salon: {
        title: "Удалить салон?",
        message:
          "Салон будет удален вместе со всеми услугами, товарами и связанными записями.",
      },
      service: {
        title: "Удалить услугу?",
        message: "Эта услуга будет удалена без возможности восстановления.",
      },
      product: {
        title: "Удалить товар?",
        message: "Этот товар будет удален без возможности восстановления.",
      },
      specialist: {
  title: "Удалить мастера?",
  message: "Мастер будет удален без возможности восстановления.",
},
    };

    setConfirmState({
      isOpen: true,
      type,
      id,
      title: config[type].title,
      message: config[type].message,
    });
  }

  function closeDeleteModal() {
    setConfirmState({
      isOpen: false,
      type: "",
      id: null,
      title: "",
      message: "",
    });
  }

  async function handleConfirmDelete() {
    try {
      if (confirmState.type === "salon") {
        await api.delete(`/owner/salons/${confirmState.id}`);
        toast.success("Салон удален");
        loadOwnerSalons();
        loadDashboard();
      }

      if (confirmState.type === "service") {
        await api.delete(`/owner/services/${confirmState.id}`);
        toast.success("Услуга удалена");
        loadOwnerSalons();
      }

      if (confirmState.type === "product") {
        await api.delete(`/owner/products/${confirmState.id}`);
        toast.success("Товар удален");
        loadOwnerSalons();
      }

      if (confirmState.type === "specialist") {
  await api.delete(`/owner/specialists/${confirmState.id}`);
  toast.success("Мастер удален");
  loadOwnerSalons();
}

      closeDeleteModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка удаления");
    }
  }
  function handleSpecialistChange(e) {
  setFormSpecialist({ ...formSpecialist, [e.target.name]: e.target.value });
}

async function createSpecialist(e) {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append("salonId", formSpecialist.salonId);
    formData.append("fullName", formSpecialist.fullName);
    formData.append("title", formSpecialist.title);
    formData.append("bio", formSpecialist.bio);
    formData.append("workStartTime", formSpecialist.workStartTime);
    formData.append("workEndTime", formSpecialist.workEndTime);
    formData.append("workDays", formSpecialist.workDays);

    if (formSpecialist.photo) {
      formData.append("photo", formSpecialist.photo);
    }

    await api.post("/owner/specialists", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Мастер добавлен");
    setFormSpecialist({
      salonId: "",
      fullName: "",
      title: "",
      bio: "",
      photo: null,
    });
    loadOwnerSalons();
  } catch (error) {
    toast.error(error.response?.data?.message || "Ошибка добавления мастера");
  }
}

function handleWorkChange(e) {
  setFormWork({ ...formWork, [e.target.name]: e.target.value });
}

async function createSpecialistWork(e) {
const deleteSpecialistWork = async (workId) => {
  try {
    await api.delete(`/owner/specialist-works/${workId}`);

    toast.success("Работа удалена");

    await loadOwnerSalons();
  } catch (error) {
    console.error(error);
    toast.error("Ошибка удаления работы");
  }
};
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append("specialistId", formWork.specialistId);
    formData.append("caption", formWork.caption);

    if (formWork.image) {
      formData.append("image", formWork.image);
    }

    await api.post("/owner/specialist-works", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Работа мастера добавлена");
    setIsWorkModalOpen(false);
    setFormWork({
      specialistId: "",
      caption: "",
      image: null,
    });
    loadOwnerSalons();
  } catch (error) {
    toast.error(error.response?.data?.message || "Ошибка добавления работы");
  }
}

async function deleteSpecialistWork(workId) {
  try {
    await api.delete(`/owner/specialist-works/${workId}`);
    toast.success("Работа удалена");
    loadOwnerSalons();
  } catch (error) {
    toast.error(error.response?.data?.message || "Ошибка удаления работы");
  }
}

function startEditSpecialist(specialist) {
  setEditingSpecialistId(specialist.id);
  setEditformSpecialist({
    fullName: specialist.fullName || "",
    title: specialist.title || "",
    bio: specialist.bio || "",
    photo: null,
    workStartTime: specialist.workStartTime || "09:00",
    workEndTime: specialist.workEndTime || "18:00",
    workDays: specialist.workDays || "1,2,3,4,5,6",
  });
}

const saveSpecialistEdit = async (specialistId) => {
  try {
    const token = sessionStorage.getItem("token");

    const formData = new FormData();

    formData.append(
      "fullName",
      editformSpecialist.fullName
    );

    formData.append(
      "title",
      editformSpecialist.title
    );

    formData.append(
      "bio",
      editformSpecialist.bio
    );
    formData.append("salonId", editformSpecialist.salonId);

    if (editformSpecialist.photo) {
  formData.append(
    "photo",
    editformSpecialist.photo
  );
}

    await api.patch(`/owner/specialists/${specialistId}`, formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

    toast.success("Мастер обновлен");

setEditingSpecialistId(null);
setEditingSpecialist(null);
setIsSpecialistModalOpen(false);

await loadOwnerSalons();
  } catch (error) {
    console.error(error);

    toast.error("Ошибка обновления мастера");
  }
};

function handleSpecialistServiceChange(e) {
  setFormSpecialistService({
    ...formSpecialistService,
    [e.target.name]: e.target.value,
  });
}

async function createSpecialistService(e) {
  e.preventDefault();

  try {
    await api.post("/owner/specialist-services", {
      specialistId: Number(formSpecialistService.specialistId),
      serviceId: Number(formSpecialistService.serviceId),
    });

    toast.success("Услуга привязана к мастеру");
    setIsSpecialistServiceModalOpen(false);
    setFormSpecialistService({
      specialistId: "",
      serviceId: "",
    });
    loadOwnerSalons();
  } catch (error) {
    toast.error(error.response?.data?.message || "Ошибка привязки услуги");
  }
}

async function deleteSpecialistService(id) {
  try {
    await api.delete(`/owner/specialist-services/${id}`);
    toast.success("Услуга отвязана");
    loadOwnerSalons();
  } catch (error) {
    toast.error(error.response?.data?.message || "Ошибка удаления связи");
  }
}

function toggleWorkDay(day) {
  const currentDays = (formSpecialist.workDays || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const updatedDays = currentDays.includes(String(day))
    ? currentDays.filter((item) => item !== String(day))
    : [...currentDays, String(day)];

  setFormSpecialist({
    ...formSpecialist,
    workDays: updatedDays.sort((a, b) => Number(a) - Number(b)).join(","),
  });
}

function toggleEditWorkDay(day) {
  const currentDays = (editformSpecialist.workDays || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const updatedDays = currentDays.includes(String(day))
    ? currentDays.filter((item) => item !== String(day))
    : [...currentDays, String(day)];

  setEditformSpecialist({
    ...editformSpecialist,
    workDays: updatedDays.sort((a, b) => Number(a) - Number(b)).join(","),
  });
}

const weekDays = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 7, label: "Вс" },
];

const timeOptions = [];
for (let hour = 0; hour < 24; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    timeOptions.push(`${hh}:${mm}`);
  }
}
const [ownerChats, setOwnerChats] = useState([]);
const [selectedChatId, setSelectedChatId] = useState(null);
const [chatMessages, setChatMessages] = useState([]);
const [chatText, setChatText] = useState("");

async function loadOwnerChats() {
  try {
    const res = await api.get("/chats");
    setOwnerChats(res.data || []);
  } catch (error) {
    toast.error("Ошибка загрузки чатов");
  }
}

async function openChat(chatId) {
  try {
    setSelectedChatId(chatId);
    const res = await api.get(`/chats/${chatId}/messages`);
    setChatMessages(res.data || []);
  } catch (error) {
    toast.error("Ошибка открытия чата");
  }
}

async function sendOwnerMessage(e) {
  e.preventDefault();

  if (!chatText.trim() || !selectedChatId) return;

  try {
    const res = await api.post(`/chats/${selectedChatId}/messages`, {
      text: chatText,
    });

    setChatMessages((prev) => [...prev, res.data]);
    setChatText("");
    loadOwnerChats();
  } catch (error) {
    toast.error("Ошибка отправки сообщения");
  }
}

  return (
    <div className="min-h-screen bg-[#fff7f5] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-24 z-40 ml-4 mt-2 mb-3 w-fit">
  <button
    type="button"
    onClick={() => window.history.back()}
    className={`bg-white/95 backdrop-blur shadow-md border border-[#fdeae5] text-[#ee8585] transition-all duration-300 flex items-center justify-center ${
      isScrolled
        ? "w-11 h-11 rounded-full text-2xl"
        : "px-4 py-2 rounded-2xl gap-2 text-lg"
    }`}
  >
    <span>←</span>
    {!isScrolled && <span>Назад</span>}
  </button>
</div>
        <h1 className="text-3xl font-semibold">
  Кабинет владельца
</h1>

<OwnerTabs
  activeTab={activeTab}
  setActiveTab={setActiveTab}
/>
{activeTab === "specialists" && (
  <div className="space-y-5 mt-6">
    <div className="flex justify-end mb-4">
  <Button
  onClick={() => {
    setIsSpecialistModalOpen(true);

    setEditingSpecialist(null);

    setFormSpecialist({
      salonId: ownerSalons[0]?.id || "",
      fullName: "",
      title: "",
      bio: "",
      photo: null,
      workStartTime: "09:00",
      workEndTime: "18:00",
      workDays: "1,2,3,4,5,6",
    });
  }}
>
  + Добавить мастера
</Button>
</div>
  {ownerSalons.flatMap((salon) =>
    salon.specialists.map((specialist) => (
      <div
        key={specialist.id}
        className="bg-white rounded-[32px] border border-[#fdeae5] shadow-md p-5"
      >
        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-center">
          <div className="bg-[#fff7f5] rounded-3xl overflow-hidden flex justify-center">
            {specialist.photoUrl && (
              <img
                src={`http://localhost:5000${specialist.photoUrl}`}
                alt={specialist.fullName}
                className="h-64 w-full object-contain cursor-pointer"
                onClick={() =>
                  setSelectedSpecialistPhoto(
                    `http://localhost:5000${specialist.photoUrl}`
                  )
                }
              />
            )}
          </div>

          <div className="min-w-0">
  <div className="grid md:grid-cols-4 gap-5 mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {specialist.fullName}
                </h3>
                <p className="text-[#ee8585] text-xl mt-2">
                  {specialist.title || "Специалист"}
                </p>
                <p className="text-gray-500 mt-2">
  Салон:{" "}
  <span className="font-medium text-gray-800">
    {salon.name}
  </span>
</p>
              </div>

              <div>
                <p className="text-gray-500">Описание</p>
                <p className="font-medium">
                  {specialist.bio || "Без описания"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Услуг привязано</p>
                <p className="text-2xl font-bold">
                  {specialist.specialistServices?.length || 0}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Работы в портфолио</p>
                <p className="text-2xl font-bold">
                  {specialist.works?.length || 0}
                </p>
              </div>
            </div>
            
{specialist.works?.length > 0 && (
  <div className="mt-5 mb-5 max-w-full overflow-hidden">
  <p className="text-gray-500 mb-2">Работы</p>

  <div className="flex max-w-full gap-3 overflow-x-auto overflow-y-hidden pb-3">
    {specialist.works.map((work) => (
      <div
  key={work.id}
  className="group relative h-24 w-24 min-w-[96px] flex-shrink-0 overflow-hidden rounded-2xl"
>
  <img
    src={`http://localhost:5000${work.imageUrl}`}
    alt={work.caption || "Работа мастера"}
    onClick={() => {
      setSelectedWorkImage(`http://localhost:5000${work.imageUrl}`);
      setSelectedWorkCaption(work.caption || "");
    }}
    className="h-24 w-24 min-w-[96px] cursor-pointer rounded-2xl object-cover border border-[#fdeae5]"
  />

</div>
    ))}
  </div>
</div>
)}

            <div className="grid md:grid-cols-1 gap-3">
  <Button onClick={() => navigate(`/specialists/${specialist.id}/manage`)}>
    Настройки мастера
  </Button>
</div>
          </div>
        </div>
      </div>
    ))
  )}
</div>
)}
{activeTab === "overview" && (
  <div className="grid md:grid-cols-2 gap-6 mb-8 mt-6">
    <div
      onClick={() => setActiveTab("bookings")}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition rounded-3xl border border-[#fdeae5] bg-white">
        <h2 className="text-2xl font-bold mb-4">Обзор активности</h2>

        <div className="flex items-end gap-6">
          <div className="flex-1">
            <div className="h-24 rounded-2xl bg-[#fff7f5] flex items-end px-4 pb-4">
              <div className="w-full h-16 border-b-4 border-[#ee8585] rounded-full opacity-70" />
            </div>

            <p className="text-gray-600 mt-4">
              Нажмите для управления записями
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold text-gray-900">
              {dashboard.bookingsCount}
            </p>
            <p className="text-green-600 font-medium mt-1">↑ +5%</p>
            <p className="text-gray-700 mt-2">Записи</p>
          </div>
        </div>
      </Card>
    </div>

    <Card className="rounded-3xl border border-[#fdeae5] bg-white">
      <h2 className="text-2xl font-bold mb-4">Финансовая сводка</h2>

      <p className="text-3xl font-bold text-gray-900">
        {dashboard.totalSales} сом
      </p>

      <p className="text-gray-600 mt-3">
        Валовая выручка
      </p>
    </Card>
  </div>
)}
        
{activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6 mb-8 mt-6">
          <div className="flex flex-wrap gap-4 mb-8 mt-6">
  <button
    onClick={() => setIsSalonModalOpen(true)}
    className="flex items-center gap-2 bg-white border border-[#fdeae5] rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition text-[#ee8585] font-medium"
  >
    <span className="text-2xl leading-none">+</span>
    <span>Добавить салон</span>
  </button>

  <button
    onClick={() => setIsProductModalOpen(true)}
    className="flex items-center gap-2 bg-white border border-[#fdeae5] rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition text-[#ee8585] font-medium"
  >
    <span className="text-2xl leading-none">+</span>
    <span>Добавить товар</span>
  </button>
  <button
  onClick={() => setIsServiceModalOpen(true)}
  className="flex items-center gap-2 bg-white border border-[#fdeae5] rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition text-[#ee8585] font-medium"
>
  <span className="text-2xl leading-none">+</span>
  <span>Добавить услугу</span>
</button>
</div>
          </div>
)}

{activeTab === "salons" && (
        <div className="mb-8 mt-0">
          {ownerSalons.length === 0 ? (
            <p className="text-gray-500">У вас пока нет салонов.</p>
          ) : (
            <div className="space-y-8">
              {ownerSalons.map((salon) => (
  <div
  key={salon.id}
  className="bg-white rounded-3xl shadow-md border border-[#fdeae5] p-6 mb-6"
>
    {editingSalonId === salon.id ? (
      <div className="w-full max-w-5xl mx-auto space-y-5 bg-gradient-to-br from-[#fffaf8] to-[#fff3f0] border border-[#f6d7d1] rounded-[36px] p-6 shadow-2xl">
        <div className="mb-8">
  <h2 className="text-3xl font-serif text-[#7d5c5c] mb-2">
    Редактировать салон
  </h2>

  <p className="text-gray-500 text-lg">
    Обновите информацию о вашем beauty salon
  </p>
</div>
        <input
          type="text"
          value={editSalonForm.name}
          onChange={(e) =>
            setEditSalonForm({
              ...editSalonForm,
              name: e.target.value,
            })
          }
          className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          placeholder="Название салона"
        />

        <textarea
          value={editSalonForm.description}
          onChange={(e) =>
            setEditSalonForm({
              ...editSalonForm,
              description: e.target.value,
            })
          }
          className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          rows="4"
          placeholder="Описание"
        />

        <input
          type="text"
          value={editSalonForm.address}
          onChange={(e) =>
            setEditSalonForm({
              ...editSalonForm,
              address: e.target.value,
            })
          }
          className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          placeholder="Адрес"
        />

        <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#fdeae5] bg-[#fff7f5] p-5 cursor-pointer hover:bg-[#fff1ee] transition">
  <span className="text-3xl mb-4">📸</span>

  <p className="text-lg font-semibold text-gray-800">
    Загрузить новое фото
  </p>

  <p className="text-sm text-gray-500 mt-1">
    PNG, JPG до 10MB
  </p>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
  setFormSalon({
  ...formSalon,
  image: e.target.files?.[0] || null,
})
}
    className="hidden"
  />
  {editSalonForm.image && (
  <p className="text-sm text-gray-500 mt-2">
    Выбрано: {editSalonForm.image.name}
  </p>
)}
</label>

        <div className="flex gap-2">
          <Button onClick={() => saveSalonEdit(salon.id)}>
            Сохранить
          </Button>
          <Button
            className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
            onClick={() => setEditingSalonId(null)}
          >
            Отмена
          </Button>
        </div>
      </div>
    ) : (
  <>
    {activeTab === "salons" && (
      <>
        <div className="grid md:grid-cols-[280px_1fr] gap-6 items-start">
  {salon.imageUrl && (
    <img
      src={`https://beauty-studio-backend-uuve.onrender.com${salon.imageUrl}`}
      alt={salon.name}
      className="w-full h-56 object-cover rounded-3xl border border-[#fdeae5]"
    />
  )}

  <div>
    <h3 className="text-3xl font-bold text-gray-900 mb-2">
      {salon.name}
    </h3>

    <p className="text-gray-600 text-lg mb-2">
      {salon.description || "Описание пока не добавлено"}
    </p>

    <p className="text-gray-500 mb-5">
      {salon.address || "Адрес не указан"}
    </p>

    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="rounded-2xl bg-[#fff7f5] border border-[#fdeae5] p-4 text-center">
        <p className="text-2xl font-bold text-gray-900">
          {salon.services?.length || 0}
        </p>
        <p className="text-sm text-gray-500">Услуги</p>
      </div>

      <div className="rounded-2xl bg-[#fff7f5] border border-[#fdeae5] p-4 text-center">
        <p className="text-2xl font-bold text-gray-900">
          {salon.products?.length || 0}
        </p>
        <p className="text-sm text-gray-500">Товары</p>
      </div>

      <div className="rounded-2xl bg-[#fff7f5] border border-[#fdeae5] p-4 text-center">
        <p className="text-2xl font-bold text-gray-900">
          {salon.specialists?.length || 0}
        </p>
        <p className="text-sm text-gray-500">Мастера</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-3 mt-5">
          <Button onClick={() => startEditSalon(salon)}>
            Изменить Салон
          </Button>

          <Button
            className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
            onClick={() => openDeleteModal("salon", salon.id)}
          >
            Удалить Салон
          </Button>
        </div>
        </div>
        </div>
      </>
    )}
  </>
)}
{activeTab === "overview" && (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div>
        <h4 className="text-xl font-semibold mb-3">Услуги</h4>

        {salon.services.length === 0 ? (
  <div className="border border-dashed border-pink-200 rounded-2xl p-6 text-gray-500 bg-[#fff7f5]">
    Услуг пока нет
  </div>
) : (
  <div className="space-y-3">
    {salon.services.map((service) => (
      <div
        key={service.id}
        className="bg-white rounded-2xl p-5 shadow-sm border border-[#fdeae5] max-w-md"
      >
        {editingServiceId === service.id ? (
          <div className="space-y-4 bg-[#fff7f5] border border-[#fdeae5] rounded-3xl p-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Название услуги
              </label>
              <input
                type="text"
                value={editServiceForm.name}
                onChange={(e) =>
                  setEditServiceForm({
                    ...editServiceForm,
                    name: e.target.value,
                  })
                }
                placeholder="Например: Маникюр"
                className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Описание
              </label>
              <textarea
                value={editServiceForm.description}
                onChange={(e) =>
                  setEditServiceForm({
                    ...editServiceForm,
                    description: e.target.value,
                  })
                }
                placeholder="Опишите услугу"
                className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Цена
              </label>
              <input
                type="number"
                value={editServiceForm.price}
                onChange={(e) =>
                  setEditServiceForm({
                    ...editServiceForm,
                    price: e.target.value,
                  })
                }
                placeholder="Например: 600"
                className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Длительность (мин)
              </label>
              <input
                type="number"
                value={editServiceForm.durationMin}
                onChange={(e) =>
                  setEditServiceForm({
                    ...editServiceForm,
                    durationMin: e.target.value,
                  })
                }
                placeholder="Например: 60"
                className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => saveServiceEdit(service.id)}>
                Сохранить
              </Button>
              <Button
                className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
                onClick={() => setEditingServiceId(null)}
              >
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-semibold">{service.name}</p>
            <p className="text-gray-600">{service.description}</p>
            <p className="text-gray-500 text-sm">
              {service.price} сом • {service.durationMin} мин
            </p>

            <div className="flex gap-2 mt-3">
             Изменить
              <Button
                className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
                onClick={() => openDeleteModal("service", service.id)}
              >
                Удалить
              </Button>
            </div>
          </>
        )}
      </div>
    ))}
  </div>
)}
      </div>

      <div>
        <h4 className="text-xl font-semibold mb-3">Товары</h4>

        {salon.products.length === 0 ? (
  <div className="border border-dashed border-pink-200 rounded-2xl p-6 text-gray-500 bg-[#fff7f5]">
    Товаров пока нет
  </div>
) : (
  <div className="space-y-3">
    {salon.products.map((product) => (
      <div
        key={product.id}
        className="bg-white rounded-2xl p-5 shadow-sm border border-[#fdeae5] max-w-md"
      >
        {editingProductId === product.id ? (
          <div className="space-y-4 bg-[#fff7f5] border border-[#fdeae5] rounded-3xl p-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Название товара
              </label>
              <input
                type="text"
                value={editProductForm.name}
                onChange={(e) =>
                  setEditProductForm({
                    ...editProductForm,
                    name: e.target.value,
                  })
                }
                placeholder="Например: Сыворотка"
                className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Описание
              </label>
              <textarea
                value={editProductForm.description}
                onChange={(e) =>
                  setEditProductForm({
                    ...editProductForm,
                    description: e.target.value,
                  })
                }
                placeholder="Опишите товар"
                className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Цена
              </label>
              <input
                type="number"
                value={editProductForm.price}
                onChange={(e) =>
                  setEditProductForm({
                    ...editProductForm,
                    price: e.target.value,
                  })
                }
                placeholder="Например: 1200"
                className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Количество
              </label>
              <input
                type="number"
                value={editProductForm.stock}
                onChange={(e) =>
                  setEditProductForm({
                    ...editProductForm,
                    stock: e.target.value,
                  })
                }
                placeholder="Например: 10"
                className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => saveProductEdit(product.id)}>
                Сохранить
              </Button>
              <Button
                className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
                onClick={() => setEditingProductId(null)}
              >
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-semibold">{product.name}</p>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-gray-500 text-sm">
              {product.price} сом • stock: {product.stock}
            </p>

            <div className="flex gap-2 mt-3">
             <Button onClick={() => startEditProduct(product)}>
  Изменить
</Button>
              <Button
                className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
                onClick={() => openDeleteModal("product", product.id)}
              >
                Удалить
              </Button>
            </div>
          </>
        )}
      </div>
    ))}
  </div>
)}
      </div>
    </div>
)}
  
  </div>
))}
            </div>
          )}
        </div>
)}

        {activeTab === "bookings" && (
  <Card className="mt-6">
  <OwnerBookingsSection
    bookings={dashboard.incomingBookings}
    onUpdateStatus={updateBookingStatus}
  />
</Card>
        )}
        {activeTab === "chats" && (
  <Card className="mt-6">
    <div className="grid md:grid-cols-3 gap-6 min-h-[500px]">
      <div className="border-r border-[#fdeae5] pr-4">
        <h2 className="text-2xl font-semibold mb-4">Чаты</h2>

        {ownerChats.length === 0 ? (
          <p className="text-gray-500">Пока нет сообщений.</p>
        ) : (
          <div className="space-y-3">
            {ownerChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => openChat(chat.id)}
                className={`w-full text-left rounded-2xl p-4 border transition ${
                  selectedChatId === chat.id
                    ? "bg-[#fff7f5] border-pink-300"
                    : "bg-white border-[#fdeae5] hover:bg-[#fff7f5]"
                }`}
              >
                <p className="font-semibold text-gray-900">
                  {chat.client?.fullName || chat.client?.email || "Клиент"}
                </p>
                <p className="text-sm text-gray-500">{chat.salon?.name}</p>
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                  {chat.messages?.[0]?.text || "Нет сообщений"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2 flex flex-col">
        {!selectedChatId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Выберите чат слева
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl bg-[#fff7f5] px-4 py-3"
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {message.sender?.fullName || "Пользователь"}
                  </p>
                  <p className="text-gray-800">{message.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  </Card>
)}

{isSalonModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-2xl rounded-[40px] bg-white p-8 shadow-2xl border border-[#fdeae5]">
      <h3 className="text-2xl font-bold mb-4">Создать салон</h3>

      <form onSubmit={createSalon} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Название салона"
          value={formSalon.name}
          onChange={handleSalonChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
          required
        />

        <textarea
          name="description"
          placeholder="Описание"
          value={formSalon.description}
          onChange={handleSalonChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
          rows="3"
        />

        <input
          type="text"
          name="address"
          placeholder="Адрес"
          value={formSalon.address}
          onChange={handleSalonChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
        />

        <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#fdeae5] bg-[#fff7f5] p-5 cursor-pointer hover:bg-[#fff1ee] transition">
  <span className="text-3xl mb-4">📸</span>

  <p className="text-lg font-semibold text-gray-800">
    Загрузить новое фото
  </p>

  <p className="text-sm text-gray-500 mt-1">
    PNG, JPG до 10MB
  </p>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
  setFormWork({
  ...formWork,
  image: e.target.files?.[0] || null,
})
}
    className="hidden"
  />
</label>

        <div className="flex justify-end gap-3 pt-3">
          <Button
            type="button"
            className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
            onClick={() => setIsSalonModalOpen(false)}
          >
            Отмена
          </Button>

          <Button type="submit">Создать</Button>
        </div>
      </form>
    </div>
  </div>
)}

{isProductModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-2xl rounded-[40px] bg-white p-8 shadow-2xl border border-[#fdeae5]">
      <h3 className="text-2xl font-bold mb-4">Добавить товар</h3>

      <form onSubmit={createProduct} className="space-y-3">
        <select
          name="salonId"
          value={formProduct.salonId}
          onChange={handleProductChange}
          className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          required
        >
          <option value="">Выберите салон</option>
          {ownerSalons.map((salon) => (
            <option key={salon.id} value={salon.id}>
              {salon.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="name"
          placeholder="Название товара"
          value={formProduct.name}
          onChange={handleProductChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
          required
        />

        <textarea
          name="description"
          placeholder="Описание"
          value={formProduct.description}
          onChange={handleProductChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
          rows="3"
        />

        <input
          type="number"
          name="price"
          placeholder="Цена"
          value={formProduct.price}
          onChange={handleProductChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
          required
        />

        <input
          type="number"
          name="stock"
          placeholder="Количество"
          value={formProduct.stock}
          onChange={handleProductChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
          required
        />

        <div className="flex justify-end gap-3 pt-3">
          <Button
            type="button"
            className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
            onClick={() => setIsProductModalOpen(false)}
          >
            Отмена
          </Button>

          <Button type="submit">Добавить</Button>
        </div>
      </form>
    </div>
  </div>
)}
{isServiceModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-2xl rounded-[40px] bg-white p-8 shadow-2xl border border-[#fdeae5]">
      <h3 className="text-2xl font-bold mb-4">Добавить услугу</h3>

      <form onSubmit={createService} className="space-y-3">
        <select
          name="salonId"
          value={formService.salonId}
          onChange={handleServiceChange}
          className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          required
        >
          <option value="">Выберите салон</option>

          {ownerSalons.map((salon) => (
            <option key={salon.id} value={salon.id}>
              {salon.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="name"
          placeholder="Название услуги"
          value={formService.name}
          onChange={handleServiceChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
          required
        />

        <textarea
          name="description"
          placeholder="Описание"
          value={formService.description}
          onChange={handleServiceChange}
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
          rows="3"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            name="price"
            placeholder="Цена"
            value={formService.price}
            onChange={handleServiceChange}
            className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
            required
          />

          <input
            type="number"
            name="durationMinutes"
            placeholder="Длительность"
            value={formService.durationMinutes}
            onChange={handleServiceChange}
            className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button
            type="button"
            className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
            onClick={() => setIsServiceModalOpen(false)}
          >
            Отмена
          </Button>

          <Button type="submit">Добавить</Button>
        </div>
      </form>
    </div>
  </div>
)}

        {confirmState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-2xl rounded-[40px] bg-white p-8 shadow-2xl border border-[#fdeae5]">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {confirmState.title}
              </h3>
              <p className="text-gray-600 mb-6">{confirmState.message}</p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-5 py-3 rounded-2xl border border-pink-200 text-[#ee8585] hover:bg-[#fff7f5] transition"
                >
                  Отмена
                </button>

                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-3 rounded-2xl bg-[#ee8585] text-white hover:bg-[#ee8585] transition shadow-md"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
      {isSpecialistModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl rounded-[40px] bg-white p-8 shadow-2xl border border-[#fdeae5]">
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">
            {editingSpecialist
              ? "Редактировать мастера"
              : "Новый мастер"}
          </h2>

          <p className="text-gray-500 mt-2">
            Управление профилем специалиста
          </p>
        </div>

        <button
          onClick={() => setIsSpecialistModalOpen(false)}
          className="text-4xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-5">

  <select
    name="salonId"
    value={
      editingSpecialist
        ? editformSpecialist.salonId
        : formSpecialist.salonId
    }
    onChange={(e) => {
      if (editingSpecialist) {
        setEditformSpecialist({
          ...editformSpecialist,
          salonId: e.target.value,
        });
      } else {
        setFormSpecialist({
          ...formSpecialist,
          salonId: e.target.value,
        });
      }
    }}
    className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-6 py-4 text-lg outline-none"
    required
  >
    <option value="">Выберите салон</option>

    {ownerSalons.map((salon) => (
      <option key={salon.id} value={salon.id}>
        {salon.name}
      </option>
    ))}
  </select>

  <input
          type="text"
          placeholder="Имя мастера"
          value={editingSpecialist ? editformSpecialist.fullName : formSpecialist.fullName}
          onChange={(e) =>
            setFormSpecialist({
              ...formSpecialist,
              fullName: e.target.value,
            })
          }
          className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-6 py-4 text-lg outline-none"
        />

        <input
          type="text"
          placeholder="Специализация"
          value={formSpecialist.title}
          onChange={(e) =>
            setFormSpecialist({
              ...formSpecialist,
              title: e.target.value,
            })
          }
          className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-6 py-4 text-lg outline-none"
        />

        <textarea
          placeholder="Описание"
          value={formSpecialist.bio}
          onChange={(e) =>
            setFormSpecialist({
              ...formSpecialist,
              bio: e.target.value,
            })
          }
          className="w-full min-h-[140px] resize-none rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-6 py-4 text-lg outline-none"
        />

        <div className="flex gap-4 pt-4">
          <Button
  onClick={
    editingSpecialist
      ? () => saveSpecialistEdit(editingSpecialist.id)
      : createSpecialist
  }
>
  {editingSpecialist ? "Сохранить" : "Создать"}
</Button>

          <Button
            variant="outline"
            onClick={() => setIsSpecialistModalOpen(false)}
          >
            Отмена
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
{isSpecialistServiceModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-xl rounded-[40px] bg-white p-8 shadow-2xl border border-[#fdeae5]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Связать услугу
          </h2>
          <p className="text-gray-500 mt-2">
            Мастер: {selectedSpecialistForService?.fullName}
          </p>
        </div>

        <button
          onClick={() => setIsSpecialistServiceModalOpen(false)}
          className="text-4xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <form onSubmit={createSpecialistService} className="space-y-5">
        <select
          name="serviceId"
          value={formSpecialistService.serviceId}
          onChange={handleSpecialistServiceChange}
          className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-6 py-4 text-lg outline-none"
          required
        >
          <option value="">Выберите услугу</option>

          {ownerSalons
            .flatMap((salon) => salon.services)
            .map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
        </select>

        <div className="flex gap-3 pt-3">
          <Button type="submit">Связать</Button>

          <Button
            type="button"
            className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
            onClick={() => setIsSpecialistServiceModalOpen(false)}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  </div>
)}
{selectedWorkImage && (
  <div
    className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
    onClick={() => {
      setSelectedWorkImage(null);
      setSelectedWorkCaption("");
    }}
  >
    <div
      className="max-w-5xl w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={selectedWorkImage}
        alt="Работа мастера"
        className="max-w-full max-h-[80vh] mx-auto rounded-3xl shadow-2xl"
      />

      {selectedWorkCaption && (
        <div className="mt-4 rounded-3xl bg-white/10 backdrop-blur-md p-5 text-white text-center text-lg">
          {selectedWorkCaption}
        </div>
      )}
    </div>
  </div>
)}
{isWorkModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-xl rounded-[40px] bg-white p-8 shadow-2xl border border-[#fdeae5]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Добавить работу
          </h2>

          <p className="text-gray-500 mt-2">
            Загрузите фото работы мастера
          </p>
        </div>

        <button
          onClick={() => setIsWorkModalOpen(false)}
          className="text-4xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <form onSubmit={createSpecialistWork} className="space-y-5">
        <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#fdeae5] bg-[#fff7f5] p-8 cursor-pointer hover:bg-[#fff1ee] transition">
          <span className="text-4xl mb-4">📸</span>

          <p className="text-lg font-semibold text-gray-800">
            Выбрать фото
          </p>

          <p className="text-sm text-gray-500 mt-1">
            PNG, JPG до 10MB
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
  setEditSalonForm({
    ...editSalonForm,
    image: e.target.files?.[0] || null,
  })
}
            className="hidden"
            required
          />
        </label>

        {formWork.image && (
  <p className="text-sm text-gray-500 mt-2">
    Выбрано: {editSalonForm.image.name}
  </p>
)}

        <textarea
          name="caption"
          placeholder="Подпись к работе"
          value={formWork.caption}
          onChange={handleWorkChange}
          className="w-full min-h-[120px] resize-none rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-6 py-4 text-lg outline-none"
        />

        <div className="flex gap-3 pt-3">
          <Button type="submit">Добавить</Button>

          <Button
            type="button"
            className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]"
            onClick={() => setIsWorkModalOpen(false)}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  </div>
)}
      {selectedSpecialistPhoto && (
  <div
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    onClick={() => setSelectedSpecialistPhoto(null)}
  >
    <img
      src={selectedSpecialistPhoto}
      alt="Фото мастера"
      className="max-w-full max-h-full rounded-3xl shadow-2xl"
    />
  </div>
)}
    </div>
  );

  function OwnerTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "overview", label: "Обзор" },
    { key: "salons", label: "Мои салоны" },
    { key: "specialists", label: "Мастера" },
    { key: "bookings", label: "Записи" },
  ];

  return (
    <div className="sticky top-4 z-20 bg-[#fff7f5] pb-4">
      <div className="mt-2 flex flex-wrap gap-2 bg-white rounded-3xl p-2 shadow-sm border border-[#fdeae5]"> 
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
  setActiveTab(tab.key);

  if (tab.key === "specialists") {
    setSpecialistsTab("list");
  }
}}
            className={`px-5 py-3 rounded-2xl font-medium transition ${
              activeTab === tab.key
                ? "bg-[#ee8585] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-[#fff7f5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
  function OwnerBookingsSection({ bookings, onUpdateStatus }) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const today = new Date().toISOString().split("T")[0];

  const filteredBookings =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter);

  const todayBookings = filteredBookings.filter(
    (booking) =>
      booking.bookingDate === today &&
      booking.status !== "COMPLETED" &&
      booking.status !== "CANCELLED"
  );

  const upcomingBookings = filteredBookings.filter(
    (booking) =>
      booking.bookingDate > today &&
      booking.status !== "COMPLETED" &&
      booking.status !== "CANCELLED"
  );

  const historyBookings = filteredBookings.filter(
    (booking) =>
      booking.status === "COMPLETED" ||
      booking.status === "CANCELLED" ||
      booking.bookingDate < today
  );

  function BookingCard({ booking }) {
    return (
      <div className="rounded-3xl p-5 bg-white shadow-md hover:shadow-lg transition border border-pink-50">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="font-semibold text-lg">{booking.salon.name}</p>
            <p className="text-gray-600">Клиент: {booking.client.fullName}</p>
            <p className="text-gray-600">Услуга: {booking.service.name}</p>
            <p className="text-gray-600">Мастер: {booking.specialist?.fullName || "Не выбран"}</p>
            <p className="text-gray-600">Дата: {booking.bookingDate}</p>
            <p className="text-gray-600">Время: {booking.bookingTime}</p>
            <p className="text-gray-600">Стоимость: {booking.totalPrice} сом</p>
            <p className="text-gray-600 mt-1">
              Статус:{" "}
              <span className="font-medium text-[#ee8585]">
                {booking.status === "PENDING"
                ? "Ожидает"
                : booking.status === "CONFIRMED"
                ? "Подтверждено"
                : booking.status === "COMPLETED"
                ? "Завершено"
                : booking.status === "CANCELLED"
                ? "Отменено"
                : booking.status}
              </span>
            </p>
          </div>

          {booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onUpdateStatus(booking.id, "CONFIRMED")}
                className="px-4 py-2 rounded-2xl bg-[#ee8585] text-white hover:bg-[#ee8585] transition shadow-sm"
              >
                Подтверждено
              </button>

              <button
                onClick={() => onUpdateStatus(booking.id, "COMPLETED")}
                className="px-4 py-2 rounded-2xl bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5] transition"
              >
                Завершено
              </button>

              <button
                onClick={() => onUpdateStatus(booking.id, "CANCELLED")}
                className="px-4 py-2 rounded-2xl bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5] transition"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function Section({ title, items, emptyText }) {
    return (
      <div className="mb-8 last:mb-0">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>

        {items.length === 0 ? (
          <div className="border border-dashed border-pink-200 rounded-2xl p-6 text-gray-500 bg-[#fff7f5]">
            {emptyText}
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Управление записями</h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Фильтр по статусу
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 rounded-2xl border border-pink-200 outline-none bg-white"
          >
            <option value="ALL">Все</option>
            <option value="PENDING">Ожидает</option>
            <option value="CONFIRMED">Подтверждено</option>
            <option value="COMPLETED">Завершено</option>
            <option value="CANCELLED">Отменено</option>
          </select>
        </div>
      </div>

      <Section
        title="Сегодня"
        items={todayBookings}
        emptyText="На сегодня записей нет."
      />

      <Section
        title="Предстоящие"
        items={upcomingBookings}
        emptyText="Предстоящих записей пока нет."
      />

      <Section
        title="История"
        items={historyBookings}
        emptyText="История записей пока пуста."
      />
    </div>
  );
}
}