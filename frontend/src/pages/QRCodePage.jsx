import { QRCodeCanvas } from "qrcode.react";
import BackButton from "../components/BackButton";

export default function QRCodePage() {
  const siteUrl = "http://localhost:5173";

  return (
    <div className="min-h-screen bg-[#fff7f5] p-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-md p-6 text-center">
        <BackButton />

        <h1 className="text-3xl font-bold mb-4">QR код сайта</h1>

        <p className="text-gray-500 mb-6">
          Отсканируйте QR код, чтобы открыть сайт
        </p>

        <div className="flex justify-center bg-white p-6 rounded-3xl border border-[#fdeae5]">
          <QRCodeCanvas value={siteUrl} size={240} />
        </div>

        <p className="mt-5 text-[#ee8585] break-all">
          {siteUrl}
        </p>
      </div>
    </div>
  );
}