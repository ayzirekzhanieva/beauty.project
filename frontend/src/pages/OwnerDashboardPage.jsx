import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import BackToHome from "../components/BackToHome";
import { getUser } from "../services/auth";

export default function OwnerDashboardPage() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState("overview");

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
});

const [editingSpecialistId, setEditingSpecialistId] = useState(null);

const [editSpecialistForm, setEditSpecialistForm] = useState({
  fullName: "",
  title: "",
  bio: "",
  photo: null,
});

  useEffect(() => {
    loadDashboard();
    loadOwnerSalons();
  }, []);

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

function startEditSpecialist(specialist) {
  setEditingSpecialistId(specialist.id);
  setEditSpecialistForm({
    fullName: specialist.fullName || "",
    title: specialist.title || "",
    bio: specialist.bio || "",
    photo: null,
  });
}

async function saveSpecialistEdit(specialistId) {
  try {
    const formData = new FormData();
    formData.append("fullName", editSpecialistForm.fullName);
    formData.append("title", editSpecialistForm.title);
    formData.append("bio", editSpecialistForm.bio);

    if (editSpecialistForm.photo) {
      formData.append("photo", editSpecialistForm.photo);
    }

    await api.patch(`/owner/specialists/${specialistId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Мастер обновлен");
    setEditingSpecialistId(null);
    loadOwnerSalons();
  } catch (error) {
    toast.error(error.response?.data?.message || "Ошибка обновления мастера");
  }
}

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackToHome />
        <h1 className="text-4xl font-bold mb-4">Кабинет владельца</h1>

<OwnerTabs
  activeTab={activeTab}
  setActiveTab={setActiveTab}
/>
{activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6 mb-8 mt-6">
          <Card>
            <h2 className="text-xl font-semibold mb-2">Количество записей</h2>
            <p className="text-4xl font-bold text-pink-500">
              {dashboard.bookingsCount}
            </p>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-2">Общая сумма продаж</h2>
            <p className="text-4xl font-bold text-pink-500">
              {dashboard.totalSales} сом
            </p>
          </Card>
        </div>
)}
        
{activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6 mb-8 mt-6">
          <Card>
            <h2 className="text-2xl font-semibold mb-4">Создать салон</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Фото салона
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormSalon({
                      ...formSalon,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                />
              </div>
              
              <Button type="submit" className="w-full">
                Создать салон
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4">Добавить услугу</h2>
            <form onSubmit={createService} className="space-y-3">
              <select
                name="salonId"
                value={formService.salonId}
                onChange={handleServiceChange}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
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
                name="durationMin"
                placeholder="Длительность (мин)"
                value={formService.durationMin}
                onChange={handleServiceChange}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                required
              />

              <Button type="submit" className="w-full">
                Добавить услугу
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4">Добавить товар</h2>
            <form onSubmit={createProduct} className="space-y-3">
              <select
                name="salonId"
                value={formProduct.salonId}
                onChange={handleProductChange}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
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

              <Button type="submit" className="w-full">
                Добавить товар
              </Button>
            </form>
          </Card>
        </div>
)}

{(activeTab === "overview" || activeTab === "specialists") && (
        <Card className="mb-8 mt-6">
    <h2 className="text-2xl font-semibold mb-4">
  {activeTab === "specialists"
    ? "Мои салоны и мастера"
    : "Мои салоны, услуги и товары"}
</h2>

          {ownerSalons.length === 0 ? (
            <p className="text-gray-500">У вас пока нет салонов.</p>
          ) : (
            <div className="space-y-8">
              {ownerSalons.map((salon) => (
  <div
    key={salon.id}
    className="border border-pink-100 rounded-3xl p-5"
  >
    {editingSalonId === salon.id ? (
      <div className="space-y-4 mb-5 bg-pink-50 border border-pink-100 rounded-3xl p-4">
        <input
          type="text"
          value={editSalonForm.name}
          onChange={(e) =>
            setEditSalonForm({
              ...editSalonForm,
              name: e.target.value,
            })
          }
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
          placeholder="Адрес"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setEditSalonForm({
              ...editSalonForm,
              image: e.target.files?.[0] || null,
            })
          }
          className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
        />

        <div className="flex gap-2">
          <Button onClick={() => saveSalonEdit(salon.id)}>
            Сохранить
          </Button>
          <Button
            className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
            onClick={() => setEditingSalonId(null)}
          >
            Отмена
          </Button>
        </div>
      </div>
    ) : (
      <>
        <h3 className="text-2xl font-bold mb-2">{salon.name}</h3>
        <p className="text-gray-600 mb-2">{salon.description}</p>
        <p className="text-gray-500 mb-5">{salon.address}</p>

        <div className="flex gap-2 mb-5">
          <Button onClick={() => startEditSalon(salon)}>
            Edit Salon
          </Button>

          <Button
            className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
            onClick={() => openDeleteModal("salon", salon.id)}
          >
            Delete Salon
          </Button>
        </div>
      </>
    )}
{activeTab === "overview" && (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div>
        <h4 className="text-xl font-semibold mb-3">Услуги</h4>

        {salon.services.length === 0 ? (
  <div className="border border-dashed border-pink-200 rounded-2xl p-6 text-gray-500 bg-pink-50">
    Услуг пока нет
  </div>
) : (
  <div className="space-y-3">
    {salon.services.map((service) => (
      <div
        key={service.id}
        className="border border-pink-100 rounded-2xl p-4"
      >
        {editingServiceId === service.id ? (
          <div className="space-y-4 bg-pink-50 border border-pink-100 rounded-3xl p-4">
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
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => saveServiceEdit(service.id)}>
                Сохранить
              </Button>
              <Button
                className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
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
              <Button onClick={() => startEditService(service)}>
                Edit
              </Button>
              <Button
                className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
                onClick={() => openDeleteModal("service", service.id)}
              >
                Delete
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
  <div className="border border-dashed border-pink-200 rounded-2xl p-6 text-gray-500 bg-pink-50">
    Товаров пока нет
  </div>
) : (
  <div className="space-y-3">
    {salon.products.map((product) => (
      <div
        key={product.id}
        className="border border-pink-100 rounded-2xl p-4"
      >
        {editingProductId === product.id ? (
          <div className="space-y-4 bg-pink-50 border border-pink-100 rounded-3xl p-4">
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
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => saveProductEdit(product.id)}>
                Сохранить
              </Button>
              <Button
                className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
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
                Edit
              </Button>
              <Button
                className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
                onClick={() => openDeleteModal("product", product.id)}
              >
                Delete
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
{activeTab === "specialists" && (
  <div className="mt-8">
    <h4 className="text-xl font-semibold mb-3">Мастера</h4>

    {salon.specialists.length === 0 ? (
      <div className="border border-dashed border-pink-200 rounded-2xl p-6 text-gray-500 bg-pink-50">
        Мастеров пока нет
      </div>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salon.specialists.map((specialist) => (
          <div
            key={specialist.id}
            className="border border-pink-100 rounded-2xl p-4 bg-white"
          >
            {editingSpecialistId === specialist.id ? (
              <div className="space-y-4 bg-pink-50 border border-pink-100 rounded-3xl p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Имя мастера
                  </label>
                  <input
                    type="text"
                    value={editSpecialistForm.fullName}
                    onChange={(e) =>
                      setEditSpecialistForm({
                        ...editSpecialistForm,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Например: Алина"
                    className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Специализация
                  </label>
                  <input
                    type="text"
                    value={editSpecialistForm.title}
                    onChange={(e) =>
                      setEditSpecialistForm({
                        ...editSpecialistForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Например: Бровист"
                    className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={editSpecialistForm.bio}
                    onChange={(e) =>
                      setEditSpecialistForm({
                        ...editSpecialistForm,
                        bio: e.target.value,
                      })
                    }
                    placeholder="Расскажите о мастере"
                    className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Новое фото
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditSpecialistForm({
                        ...editSpecialistForm,
                        photo: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => saveSpecialistEdit(specialist.id)}>
                    Сохранить
                  </Button>
                  <Button
                    className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
                    onClick={() => setEditingSpecialistId(null)}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {specialist.photoUrl && (
                  <img
  src={`http://localhost:5000${specialist.photoUrl}`}
  alt={specialist.fullName}
  className="w-full h-48 object-cover rounded-2xl mb-4"
  onError={(e) => {
    e.currentTarget.style.display = "none";
  }}
/>
                )}

                <p className="font-semibold text-lg">{specialist.fullName}</p>

                <p className="text-pink-500">
                  {specialist.title || "Специалист"}
                </p>

                <p className="text-gray-600 mt-2">
                  {specialist.bio || "Без описания"}
                </p>

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => startEditSpecialist(specialist)}>
                    Edit
                  </Button>

                  <Button
                    className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
                    onClick={() => openDeleteModal("specialist", specialist.id)}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
  </div>
))}
            </div>
          )}
        </Card>
)}

        {activeTab === "bookings" && (
  <Card className="mt-6">
  <OwnerBookingsSection
    bookings={dashboard.incomingBookings}
    onUpdateStatus={updateBookingStatus}
  />
</Card>
        )}
        {activeTab === "specialists" && (
<Card className="mb-8">
  <h2 className="text-2xl font-semibold mb-4">Добавить мастера</h2>

  <form onSubmit={createSpecialist} className="grid md:grid-cols-2 gap-4">
    <select
      name="salonId"
      value={formSpecialist.salonId}
      onChange={handleSpecialistChange}
      className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
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
      name="fullName"
      placeholder="Имя мастера"
      value={formSpecialist.fullName}
      onChange={handleSpecialistChange}
      className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
      required
    />

    <input
      type="text"
      name="title"
      placeholder="Специализация"
      value={formSpecialist.title}
      onChange={handleSpecialistChange}
      className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
    />

    <input
      type="file"
      accept="image/*"
      onChange={(e) =>
        setFormSpecialist({
          ...formSpecialist,
          photo: e.target.files?.[0] || null,
        })
      }
      className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
    />

    <textarea
      name="bio"
      placeholder="Описание мастера"
      value={formSpecialist.bio}
      onChange={handleSpecialistChange}
      className="md:col-span-2 w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
      rows="4"
    />

    <div className="md:col-span-2">
      <Button type="submit">Добавить мастера</Button>
    </div>
  </form>
</Card> 
        )}
        {confirmState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {confirmState.title}
              </h3>
              <p className="text-gray-600 mb-6">{confirmState.message}</p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-5 py-3 rounded-2xl border border-pink-200 text-pink-500 hover:bg-pink-50 transition"
                >
                  Отмена
                </button>

                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-3 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 transition shadow-md"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function OwnerTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "overview", label: "Обзор" },
    { key: "specialists", label: "Мастера" },
    { key: "bookings", label: "Записи" },
  ];

  return (
    <div className="sticky top-4 z-20 bg-pink-50 pb-4">
      <div className="flex flex-wrap gap-2 bg-white rounded-3xl p-2 shadow-sm border border-pink-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 rounded-2xl font-medium transition ${
              activeTab === tab.key
                ? "bg-pink-500 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-pink-50"
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
      <div className="border border-pink-100 rounded-2xl p-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="font-semibold text-lg">{booking.salon.name}</p>
            <p className="text-gray-600">Клиент: {booking.client.fullName}</p>
            <p className="text-gray-600">Услуга: {booking.service.name}</p>
            <p className="text-gray-600">Дата: {booking.bookingDate}</p>
            <p className="text-gray-600">Время: {booking.bookingTime}</p>
            <p className="text-gray-600">Стоимость: {booking.totalPrice} сом</p>
            <p className="text-gray-600 mt-1">
              Статус:{" "}
              <span className="font-medium text-pink-500">{booking.status}</span>
            </p>
          </div>

          {booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onUpdateStatus(booking.id, "CONFIRMED")}
                className="px-4 py-2 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 transition shadow-sm"
              >
                Confirm
              </button>

              <button
                onClick={() => onUpdateStatus(booking.id, "COMPLETED")}
                className="px-4 py-2 rounded-2xl bg-white text-pink-500 border border-pink-300 hover:bg-pink-50 transition"
              >
                Complete
              </button>

              <button
                onClick={() => onUpdateStatus(booking.id, "CANCELLED")}
                className="px-4 py-2 rounded-2xl bg-white text-pink-500 border border-pink-300 hover:bg-pink-50 transition"
              >
                Cancel
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
          <div className="border border-dashed border-pink-200 rounded-2xl p-6 text-gray-500 bg-pink-50">
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
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
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