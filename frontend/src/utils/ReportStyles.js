// utils/ReportStyles.js
import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  detailTable: {
    marginBottom: 10,
  },
  detailTableRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  detailTableColHeader: {
    width: "35%",
    fontWeight: "bold",
  },
  detailTableColValue: {
    width: "65%",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
    fontWeight: "bold",
  },
  tableCol: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
  },
  textCenter: {
    textAlign: "center",
  },
  noDataText: {
    fontStyle: "italic",
    padding: 4,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  // Column widths
  w5: { width: "5%" },
  w15: { width: "15%" },
  w25: { width: "25%" },
  w30: { width: "30%" },
  w40: { width: "40%" },
  w55: { width: "55%" },
  w100: { width: "100%" },
});

export const formatDateForPdf = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Makassar",
    });
  } catch {
    return "-";
  }
};

export const formatDateTimeForPdf = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Makassar",
    });
  } catch {
    return "-";
  }
};
