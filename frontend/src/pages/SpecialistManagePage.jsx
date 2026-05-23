import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SpecialistManagePage() {
  const { id } = useParams();
  const [specialist, setSpecialist] = useState(null);
  const [ownerServices, setOwnerServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedWorkImage, setSelectedWorkImage] = useState(null);
  const [selectedWorkCaption, setSelectedWorkCaption] = useState("");

  const [workCaption, setWorkCaption] = useState("");
  const [workImage, setWorkImage] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
const [editForm, setEditForm] = useState({
  fullName: "",
  title: "",
  bio: "",
  photo: null,
});
const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
const navigate = useNavigate();
const [isScrolled, setIsScrolled] = useState(false);
const [isScheduleOpen, setIsScheduleOpen] = useState(false);

const [scheduleForm, setScheduleForm] = useState({
  workStartTime: "09:00",
  workEndTime: "18:00",
  workDays: "1,2,3,4,5,6",
});

  useEffect(() => {
    loadSpecialist();
  }, [id]);
  useEffect(() => {
  function handleScroll() {
    setIsScrolled(window.scrollY > 120);
  }

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  async function loadSpecialist() {
    const res = await api.get(`/owner/specialists/${id}/manage`);
    setSpecialist(res.data);
    const allServices = res.data.salon?.services || [];
    setOwnerServices(allServices);
  }

  if (!specialist) {
    return <div className="p-6">Загрузка...</div>;
  }

  async function removeService(linkId) {
  await api.delete(`/owner/specialist-services/${linkId}`);
  await loadSpecialist();
}
async function addServiceToSpecialist() {
  if (!selectedServiceId) return;

  await api.post("/owner/specialist-services", {
    specialistId: specialist.id,
    serviceId: Number(selectedServiceId),
  });

  setSelectedServiceId("");

  await loadSpecialist();
}
async function uploadWork() {
  if (!workImage) return;

  const formData = new FormData();

  formData.append("specialistId", specialist.id);
  formData.append("caption", workCaption);
  formData.append("image", workImage);

  await api.post("/owner/specialist-works", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  setWorkCaption("");
  setWorkImage(null);

  await loadSpecialist();
}

async function deleteWork(workId) {
  await api.delete(`/owner/specialist-works/${workId}`);

  await loadSpecialist();
}
async function saveProfile() {
  const formData = new FormData();

  formData.append("fullName", editForm.fullName);
  formData.append("title", editForm.title);
  formData.append("bio", editForm.bio);
  formData.append("salonId", editForm.salonId);

  if (editForm.photo) {
    formData.append("photo", editForm.photo);
  }

  await api.patch(`/owner/specialists/${specialist.id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  setIsEditOpen(false);
  await loadSpecialist();
}
async function saveSchedule() {
  const formData = new FormData();

  formData.append("fullName", specialist.fullName);
  formData.append("title", specialist.title || "");
  formData.append("bio", specialist.bio || "");
  formData.append("salonId", specialist.salonId);

  formData.append("workStartTime", scheduleForm.workStartTime);
  formData.append("workEndTime", scheduleForm.workEndTime);
  formData.append("workDays", scheduleForm.workDays);

  await api.patch(`/owner/specialists/${specialist.id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  setIsScheduleOpen(false);
  await loadSpecialist();
}
const formatWorkDays = (days) => {
  if (!days) return "Не указано";

  const map = {
    1: "Пн",
    2: "Вт",
    3: "Ср",
    4: "Чт",
    5: "Пт",
    6: "Сб",
    7: "Вс",
  };
  

  return days
    .split(",")
    .map((day) => map[day.trim()])
    .join(" • ");
};
const timeOptions = [];

for (let hour = 0; hour < 24; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    const h = String(hour).padStart(2, "0");
    const m = String(minute).padStart(2, "0");

    timeOptions.push(`${h}:${m}`);
  }
}

  return (
  <div className="min-h-screen bg-[#fff7f5] p-6">
    <div className="max-w-6xl mx-auto space-y-6">
        <div className="sticky top-5 z-40 w-fit">
  <div className="fixed top-24 left-6 z-[9999] w-fit">
  <button
    type="button"
    onClick={() => navigate(-1)}
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
</div>
      <div className="bg-white rounded-[36px] border border-[#fdeae5] shadow-md p-6">
        <div className="flex items-start gap-6">
          {specialist.photoUrl && (
            <img
              src={`http://localhost:5000${specialist.photoUrl}`}
              alt={specialist.fullName}
              className="w-40 h-40 rounded-3xl object-cover"
            />
          )}

          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {specialist.fullName}
            </h1>

            <p className="text-[#ee8585] text-xl mt-2">
              {specialist.title || "Специалист"}
            </p>

            <p className="text-gray-500 mt-2">
              Салон: {specialist.salon?.name}
            </p>

            <p className="text-gray-700 mt-4">
              {specialist.bio || "Описание пока не добавлено"}
            </p>
            <button
  onClick={() => {
    setEditForm({
  fullName: specialist.fullName || "",
  title: specialist.title || "",
  bio: specialist.bio || "",
  salonId: specialist.salonId || "",
  photo: null,
});
    setIsEditOpen(true);
  }}
  className="mt-4 rounded-2xl bg-[#ee8585] px-5 py-3 text-white"
>
  Редактировать профиль
</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[36px] border border-[#fdeae5] shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          Услуги мастера
        </h2>
        <button
  onClick={() => setIsAddServiceOpen(true)}
  className="mb-5 rounded-2xl bg-[#ee8585] px-5 py-3 text-white"
>
  + Добавить услугу
</button>

        {specialist.specialistServices?.length === 0 ? (
          <p className="text-gray-500">Услуги пока не привязаны.</p>
        ) : (
          <div className="space-y-3">
            {specialist.specialistServices.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center rounded-3xl border border-[#fdeae5] p-4"
              >
                <div>
                  <p className="font-semibold">{item.service.name}</p>
                  <p className="text-gray-500 text-sm">
                    {item.service.price} сом • {item.service.durationMin} мин
                  </p>
                </div>

                <button
  onClick={() => removeService(item.id)}
  className="text-[#ee8585] font-medium"
>
  Удалить
</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-[36px] border border-[#fdeae5] shadow-md p-6">
  <h2 className="text-xl font-bold mb-4">
    Работы мастера
  </h2>
  <button
  onClick={() => setIsAddWorkOpen(true)}
  className="mb-5 rounded-2xl bg-[#ee8585] px-5 py-3 text-white"
>
  + Добавить работу
</button>

  {specialist.works?.length === 0 ? (
    <p className="text-gray-500">Работы пока не добавлены.</p>
  ) : (
    <div className="flex gap-4 overflow-x-auto pb-3">
      {specialist.works.map((work) => (
        <div
  key={work.id}
  className="group relative"
>
  <img
    src={`http://localhost:5000${work.imageUrl}`}
    alt={work.caption || "Работа мастера"}
    onClick={() => {
      setSelectedWorkImage(`http://localhost:5000${work.imageUrl}`);
      setSelectedWorkCaption(work.caption || "");
    }}
    className="h-32 w-32 min-w-[128px] cursor-pointer rounded-3xl object-cover border border-[#fdeae5]"
  />

  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      deleteWork(work.id);
    }}
    className="
      absolute -top-1 -right-1
      flex h-7 w-7 items-center justify-center
      rounded-full bg-black/55 text-white
      shadow-lg backdrop-blur-md
      transition hover:bg-[#ee8585]
      opacity-100 md:opacity-0 md:group-hover:opacity-100
    "
  >
    ×
  </button>
</div>
      ))}
    </div>
  )}
</div>
<div className="bg-white rounded-[36px] border border-[#fdeae5] shadow-md p-6">
  <h2 className="text-2xl font-bold mb-4">
    График работы
  </h2>
  <button
  onClick={() => {
    setScheduleForm({
      workStartTime: specialist.workStartTime || "09:00",
      workEndTime: specialist.workEndTime || "18:00",
      workDays: specialist.workDays || "1,2,3,4,5,6",
    });
    setIsScheduleOpen(true);
  }}
  className="mb-5 rounded-2xl bg-[#ee8585] px-5 py-3 text-white"
>
  Редактировать график
</button>

  <div className="grid md:grid-cols-3 gap-4">
    <div className="rounded-3xl bg-[#fff7f5] border border-[#fdeae5] p-5">
      <p className="text-gray-500">Начало</p>
      <p className="text-2xl font-bold mt-2">
        {specialist.workStartTime || "09:00"}
      </p>
    </div>

    <div className="rounded-3xl bg-[#fff7f5] border border-[#fdeae5] p-5">
      <p className="text-gray-500">Конец</p>
      <p className="text-2xl font-bold mt-2">
        {specialist.workEndTime || "18:00"}
      </p>
    </div>

    <div className="rounded-3xl bg-[#fff7f5] border border-[#fdeae5] p-5">
      <p className="text-gray-500">Рабочие дни</p>
      <p className="text-2xl font-bold mt-2">
        {formatWorkDays(specialist.workDays)}
      </p>
    </div>
  </div>
</div>
    </div>
    {isAddServiceOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl border border-[#fdeae5]">
      <div className="flex justify-between items-start mb-5">
        <h2 className="text-3xl font-bold text-gray-900">Добавить услугу</h2>

        <button
          onClick={() => setIsAddServiceOpen(false)}
          className="text-4xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <select
        value={selectedServiceId}
        onChange={(e) => setSelectedServiceId(e.target.value)}
        className="w-full rounded-3xl border border-[#fdeae5] px-5 py-4 outline-none"
      >
        <option value="">Выберите услугу</option>

        {ownerServices.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>

      <div className="flex gap-3 mt-5">
        <button
          onClick={async () => {
            await addServiceToSpecialist();
            setIsAddServiceOpen(false);
          }}
          className="rounded-2xl bg-[#ee8585] px-5 py-3 text-white"
        >
          Добавить
        </button>

        <button
          onClick={() => setIsAddServiceOpen(false)}
          className="rounded-2xl border border-[#fdeae5] px-5 py-3 text-[#ee8585]"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}

{isAddWorkOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl border border-[#fdeae5]">
      <div className="flex justify-between items-start mb-5">
        <h2 className="text-3xl font-bold text-gray-900">Добавить работу</h2>

        <button
          onClick={() => setIsAddWorkOpen(false)}
          className="text-4xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <label className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#fdeae5] bg-[#fff7f5] p-6 cursor-pointer hover:bg-[#fff1ee] transition">
        <span className="text-3xl mb-3">📸</span>
        <p className="text-lg font-semibold text-gray-800">Выбрать фото</p>
        <p className="text-gray-500 mt-1">PNG, JPG до 10MB</p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setWorkImage(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>

      {workImage && (
        <p className="text-sm text-gray-500 mt-2">
          Выбрано: {workImage.name}
        </p>
      )}

      <textarea
        placeholder="Описание работы"
        value={workCaption}
        onChange={(e) => setWorkCaption(e.target.value)}
        className="mt-4 w-full min-h-[100px] rounded-3xl border border-[#fdeae5] px-5 py-4 outline-none"
      />

      <div className="flex gap-3 mt-5">
        <button
          onClick={async () => {
            await uploadWork();
            setIsAddWorkOpen(false);
          }}
          className="rounded-2xl bg-[#ee8585] px-5 py-3 text-white"
        >
          Добавить
        </button>

        <button
          onClick={() => setIsAddWorkOpen(false)}
          className="rounded-2xl border border-[#fdeae5] px-5 py-3 text-[#ee8585]"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}
{isScheduleOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl border border-[#fdeae5]">
      <div className="flex justify-between items-start mb-5">
        <h2 className="text-3xl font-bold text-gray-900">
          Редактировать график
        </h2>

        <button
          onClick={() => setIsScheduleOpen(false)}
          className="text-4xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <select
          value={scheduleForm.workStartTime}
          onChange={(e) =>
            setScheduleForm({
              ...scheduleForm,
              workStartTime: e.target.value,
            })
          }
          className="rounded-3xl border border-[#fdeae5] px-5 py-4 outline-none"
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <select
          value={scheduleForm.workEndTime}
          onChange={(e) =>
            setScheduleForm({
              ...scheduleForm,
              workEndTime: e.target.value,
            })
          }
          className="rounded-3xl border border-[#fdeae5] px-5 py-4 outline-none"
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { value: 1, label: "Пн" },
          { value: 2, label: "Вт" },
          { value: 3, label: "Ср" },
          { value: 4, label: "Чт" },
          { value: 5, label: "Пт" },
          { value: 6, label: "Сб" },
          { value: 7, label: "Вс" },
        ].map((day) => {
          const selected = scheduleForm.workDays
            .split(",")
            .includes(String(day.value));

          return (
            <button
              key={day.value}
              type="button"
              onClick={() => {
                const days = scheduleForm.workDays
                  .split(",")
                  .filter(Boolean);

                const updated = selected
                  ? days.filter((d) => d !== String(day.value))
                  : [...days, String(day.value)];

                setScheduleForm({
                  ...scheduleForm,
                  workDays: updated
                    .sort((a, b) => Number(a) - Number(b))
                    .join(","),
                });
              }}
              className={`rounded-2xl px-4 py-2 border ${
                selected
                  ? "bg-[#ee8585] text-white border-[#ee8585]"
                  : "bg-white text-gray-600 border-[#fdeae5]"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={saveSchedule}
        className="rounded-2xl bg-[#ee8585] px-6 py-3 text-white"
      >
        Сохранить
      </button>
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
{isEditOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl border border-[#fdeae5]">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Редактировать профиль
        </h2>

        <button
          onClick={() => setIsEditOpen(false)}
          className="text-4xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <input
          value={editForm.fullName}
          onChange={(e) =>
            setEditForm({ ...editForm, fullName: e.target.value })
          }
          placeholder="Имя мастера"
          className="w-full rounded-3xl border border-[#fdeae5] px-5 py-4 outline-none"
        />

        <input
          value={editForm.title}
          onChange={(e) =>
            setEditForm({ ...editForm, title: e.target.value })
          }
          placeholder="Специализация"
          className="w-full rounded-3xl border border-[#fdeae5] px-5 py-4 outline-none"
        />
        <select
  value={editForm.salonId || ""}
  onChange={(e) =>
    setEditForm({
      ...editForm,
      salonId: e.target.value,
    })
  }
  className="w-full rounded-3xl border border-[#fdeae5] px-5 py-4 outline-none"
>
  <option value="">Выберите салон</option>

  <option value={specialist.salonId}>
  {specialist.salon?.name}
</option>
</select>

        <textarea
          value={editForm.bio}
          onChange={(e) =>
            setEditForm({ ...editForm, bio: e.target.value })
          }
          placeholder="Описание"
          className="w-full min-h-[90px] rounded-3xl border border-[#fdeae5] px-5 py-4 outline-none"
        />

        <label className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#fdeae5] bg-[#fff7f5] p-4 cursor-pointer hover:bg-[#fff1ee] transition">
  <span className="text-3xl mb-4">📸</span>

  <p className="text-lg font-semibold text-gray-800">
    Выбрать фото
  </p>

  <p className="text-gray-500 mt-2">
    PNG, JPG до 10MB
  </p>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setEditForm({
        ...editForm,
        photo: e.target.files?.[0] || null,
      })
    }
    className="hidden"
  />
</label>
{editForm.photo && (
  <p className="text-sm text-gray-500">
    Выбрано: {editForm.photo.name}
  </p>
)}

        <button
          onClick={saveProfile}
          className="rounded-2xl bg-[#ee8585] px-6 py-3 text-white"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
)}
  </div>
);
}