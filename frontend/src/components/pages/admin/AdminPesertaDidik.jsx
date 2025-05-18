import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchGugusdepan } from "../../../services/GugusdepanService";
import { fetchPesertadidik } from "../../../services/PesertadidikService";
import AdminHeader from "../../atoms/AdminHeader";
import DetailCell from "../../atoms/DetailCell";
import Dropdown from "../../atoms/Dropdown";
import ErrorMessage from "../../atoms/ErrorMessage";
import FormatDate from "../../atoms/FormatDate";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import NoDataMessage from "../../atoms/NoDataMessage";
import TableR from "../../moleculs/TableR";
import AdminTemplate from "../../templates/AdminTemplate";

const AdminPesertaDidik = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [gudepList, setGudepList] = useState([]);
  const [selectedGudep, setSelectedGudep] = useState("");
  const [selectedTingkatan, setSelectedTingkatan] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pesertaResult, gudepResult] = await Promise.all([
        fetchPesertadidik(),
        fetchGugusdepan(),
      ]);

      setData(Array.isArray(pesertaResult.data) ? pesertaResult.data : []);
      setGudepList(gudepResult.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Panggil fetchData saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi untuk menangani perubahan input pencarian
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Fungsi untuk menangani perubahan filter Gudep
  const handleGudepChange = useCallback((value) => {
    setSelectedGudep(value);
  }, []);

  // Fungsi untuk menangani perubahan filter Tingkatan
  const handleTingkatanChange = useCallback((value) => {
    setSelectedTingkatan(value);
  }, []);

  // Fungsi untuk menangani perubahan filter gender
  const handleGenderChange = useCallback((value) => {
    setSelectedGender(value);
  }, []);

  // Tambahkan data Gudep ke data peserta didik
  const enrichedData = useMemo(() => {
    return data.map((item) => {
      const matchedGudep = gudepList.find(
        (gudep) => gudep.id === item.gudep_id
      );
      return {
        ...item,
        no_gudep: matchedGudep?.no_gudep ?? "-",
        tingkatan: matchedGudep?.tingkatan ?? "-",
        ttlFormatted: FormatDate(item.ttl),
      };
    });
  }, [data, gudepList]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return enrichedData.filter((item) => {
      const matchesSearch =
        (item.nama?.toLowerCase() || "").includes(query) ||
        (item.detailtingkatan?.toLowerCase() || "").includes(query) ||
        (item.no_gudep?.toLowerCase() || "").includes(query);

      const matchesGudep =
        selectedGudep === "" || item.no_gudep === selectedGudep;
      const matchesTingkatan =
        selectedTingkatan === "" || item.tingkatan === selectedTingkatan;
      const matchesGender =
        selectedGender === "" ||
        (item.gender?.toLowerCase() || "").includes(
          selectedGender.toLowerCase()
        );

      return matchesSearch && matchesGudep && matchesTingkatan && matchesGender;
    });
  }, [
    enrichedData,
    searchQuery,
    selectedGudep,
    selectedTingkatan,
    selectedGender,
  ]);

  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => ({
      no: index + 1,
      no_gudep: item.no_gudep,
      tingkatan: item.tingkatan,
      nama: item.nama,
      gender: item.gender,
      ttl: (
        <DetailCell
          title="Lihat"
          details={[{ label: "TTL", value: item.ttlFormatted }]}
        />
      ),
      detailtingkatan: item.detailtingkatan,
    }));
  }, [filteredData]);

  const gudepOptions = useMemo(() => {
    return [...new Set(enrichedData.map((item) => item.no_gudep))]
      .filter(Boolean)
      .map((gudep) => ({
        id: gudep,
        nama: gudep,
        key: `gudep-${gudep}`,
      }));
  }, [enrichedData]);

  const tingkatanOptions = useMemo(
    () => [
      { id: "Siaga", nama: "Siaga", key: "tingkatan-siaga" },
      { id: "Penggalang", nama: "Penggalang", key: "tingkatan-penggalang" },
      {
        id: "Penegak/Pandega",
        nama: "Penegak/Pandega",
        key: "tingkatan-penegak",
      },
      { id: "Pandega", nama: "Pandega", key: "tingkatan-pandega" },
    ],
    []
  );

  const genderOptions = useMemo(
    () => [
      { value: "laki-laki", label: "Laki-laki", key: "gender-laki-laki" },
      { value: "perempuan", label: "Perempuan", key: "gender-perempuan" },
    ],
    []
  );

  const headers = useMemo(
    () => [
      { key: "no", label: "No", width: "w-1/12" },
      { key: "no_gudep", label: "No. Gudep", width: "w-2/12" },
      { key: "tingkatan", label: "Tingkatan", width: "w-2/12" },
      { key: "nama", label: "Nama Peserta Didik", width: "w-3/12" },
      { key: "gender", label: "Gender", width: "w-2/12" },
      { key: "ttl", label: "Tanggal Lahir", width: "w-2/12" },
      { key: "detailtingkatan", label: "Detail Tingkatan", width: "w-2/12" },
    ],
    []
  );

  const FilterDropdowns = (
    <div className="hidden md:flex gap-2">
      <Dropdown
        options={gudepOptions}
        selected={selectedGudep}
        onChange={handleGudepChange}
        placeholder="Pilih Gudep"
      />
      <Dropdown
        options={tingkatanOptions}
        selected={selectedTingkatan}
        onChange={handleTingkatanChange}
        placeholder="Pilih Tingkatan"
      />
      <Dropdown
        options={genderOptions}
        selected={selectedGender}
        onChange={handleGenderChange}
        placeholder="Pilih Gender"
      />
    </div>
  );

  return (
    <AdminTemplate>
      <div className="md:ml-18 rounded-xl shadow-xl mt-10 md:mt-0">
        <div className="p-4">
          <AdminHeader
            title="Data Peserta Didik"
            showSearch={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            additionalControls={FilterDropdowns}
          />

          {/* Content */}
          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : transformedData.length === 0 ? (
              <NoDataMessage message="Data tidak ditemukan" />
            ) : (
              <TableR headers={headers} data={transformedData} />
            )}
          </div>
        </div>
      </div>
    </AdminTemplate>
  );
};

export default AdminPesertaDidik;
