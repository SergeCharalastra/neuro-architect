import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "outputs/neuro-smetchik-mvp";
const outputPath = `${outputDir}/NEURO_SMETCHIK_TABLE_MVP.xlsx`;

const wb = Workbook.create();

const theme = {
  dark: "#1F2937",
  primary: "#1D4ED8",
  primarySoft: "#DBEAFE",
  secondary: "#F3F4F6",
  greenSoft: "#DCFCE7",
  yellowSoft: "#FEF3C7",
  redSoft: "#FEE2E2",
  border: "#D1D5DB",
  text: "#111827",
  muted: "#6B7280",
  white: "#FFFFFF",
};

function addSheet(name) {
  const sh = wb.worksheets.add(name);
  sh.showGridLines = false;
  return sh;
}

function write(sh, address, rows) {
  sh.getRange(address).values = rows;
}

function formulas(sh, address, rows) {
  sh.getRange(address).formulas = rows;
}

function styleTitle(sh, range) {
  const r = sh.getRange(range);
  r.format.fill = { color: theme.primary };
  r.format.font = { bold: true, color: theme.white, size: 15 };
  r.format.wrapText = true;
}

function styleSubtitle(sh, range) {
  const r = sh.getRange(range);
  r.format.fill = { color: theme.primarySoft };
  r.format.font = { bold: true, color: theme.dark, size: 11 };
  r.format.wrapText = true;
}

function styleHeader(sh, range) {
  const r = sh.getRange(range);
  r.format.fill = { color: theme.dark };
  r.format.font = { bold: true, color: theme.white, size: 10 };
  r.format.wrapText = true;
}

function styleBody(sh, range) {
  const r = sh.getRange(range);
  r.format.fill = { color: theme.white };
  r.format.font = { color: theme.text, size: 10 };
  r.format.wrapText = true;
}

function setWidths(sh, widths) {
  for (const [col, px] of Object.entries(widths)) {
    sh.getRange(`${col}:${col}`).format.columnWidthPx = px;
  }
}

function freeze(sh, rows = 1) {
  try {
    sh.freezePanes.freezeRows(rows);
  } catch {
    // Freeze panes are useful but not critical for workbook correctness.
  }
}

const readme = addSheet("00_README");
const leads = addSheet("01_Заявки");
const input = addSheet("02_Вводные_по_заявке");
const materials = addSheet("03_Прайс_материалы");
const works = addSheet("04_Прайс_работы");
const logistics = addSheet("05_Расходники_логистика");
const norms = addSheet("06_Нормы_коэффициенты");
const calc = addSheet("07_Расчет");
const client = addSheet("08_Смета_для_клиента");
const manager = addSheet("09_Проверка_менеджера");
const refs = addSheet("10_Справочники");
const log = addSheet("11_Лог_изменений");

write(readme, "A1:H1", [["MVP-шаблон нейро-сметчика: NeuroAgents + расчетная таблица", "", "", "", "", "", "", ""]]);
styleTitle(readme, "A1:H1");
write(readme, "A3:H10", [
  ["Назначение", "Таблица принимает данные из NeuroAgents, хранит прайсы/нормы, считает предварительную смету и показывает менеджеру спорные места.", "", "", "", "", "", ""],
  ["Главное правило", "Агент собирает данные. Таблица считает. Менеджер проверяет. Клиент получает только проверенный или явно предварительный результат.", "", "", "", "", "", ""],
  ["MVP-фокус", "Террасы и веранды: настил, каркас, базовая кровля, фундамент как отдельный риск, логистика и резерв.", "", "", "", "", "", ""],
  ["Не делать", "Не отправлять клиенту финальную стоимость, если есть непроверенные цены, неизвестный фундамент, сложная конструкция или незаполненные ключевые данные.", "", "", "", "", "", ""],
  ["Как пользоваться", "1) Заявки попадают в лист 01. 2) Выбранная заявка переносится/подтягивается в 02. 3) Расчет на листе 07. 4) Клиентская версия на листе 08. 5) Проверка менеджера на листе 09.", "", "", "", "", "", ""],
  ["Следующий шаг", "Заполнить реальные цены, источники и дату проверки в прайсах. После этого прогнать тестовые заявки.", "", "", "", "", "", ""],
  ["Важно", "Все цены в шаблоне демонстрационные. Перед коммерческой отправкой заменить на актуальные цены региона.", "", "", "", "", "", ""],
  ["Версия", "MVP v1 / 2026-04-24", "", "", "", "", "", ""],
]);
styleBody(readme, "A3:H10");
setWidths(readme, { A: 190, B: 720, C: 40, D: 40, E: 40, F: 40, G: 40, H: 40 });

const leadHeaders = [
  "request_id", "created_at", "source", "client_name", "phone", "city_or_location",
  "object_type", "object_type_raw", "work_type", "calculation_mode", "length_m", "width_m",
  "area_m2", "foundation_type", "deck_material", "roof_required", "glazing_required",
  "has_project_file", "access_complexity", "urgency", "missing_data", "risk_flags",
  "estimate_confidence", "next_step", "manager_comment", "lead_status", "manager_status"
];
write(leads, "A1:AA1", [leadHeaders]);
write(leads, "A2:AA4", [
  ["REQ-0001", new Date("2026-04-24T15:00:00"), "Telegram", "Андрей", "+7 900 000 00 00", "Екатеринбург", "terrace", "терраса к дому", "new_build", "manual_input", 6, 4, 24, "unknown", "wpc", false, false, false, "medium", "normal", "foundation_type", "unknown_foundation", "medium", "manager_call", "Клиент хочет террасу 24 м2, фундамент не выбран, нужен звонок.", "qualified", "new"],
  ["REQ-0002", new Date("2026-04-24T15:20:00"), "Site widget", "Марина", "", "Новоалексеевка", "veranda", "закрытая веранда", "new_build", "project_pdf", 7, 4, 28, "bored_piles", "larch", true, true, true, "medium", "normal", "glazing_area_m2", "manager_review_required", "medium", "send_project", "Есть проект, нужно разобрать кровлю и остекление.", "incomplete", "new"],
  ["REQ-0003", new Date("2026-04-24T15:35:00"), "Telegram", "Игорь", "", "Екатеринбург", "canopy", "навес", "new_build", "insufficient_data", null, null, null, "unknown", "unknown", true, false, false, "unknown", "normal", "length_m,width_m,foundation_type", "unknown_dimensions,unknown_foundation", "low", "ask_more", "Клиент спросил только цену навеса, нужны размеры и состав.", "incomplete", "new"],
]);
styleHeader(leads, "A1:AA1");
styleBody(leads, "A2:AA40");
leads.getRange("B:B").setNumberFormat("yyyy-mm-dd hh:mm");
leads.getRange("K:M").setNumberFormat("0.00");
freeze(leads, 1);
setWidths(leads, {
  A: 95, B: 135, C: 100, D: 110, E: 140, F: 130, G: 100, H: 160, I: 110, J: 130,
  K: 80, L: 80, M: 80, N: 120, O: 110, P: 90, Q: 100, R: 110, S: 120, T: 90,
  U: 180, V: 210, W: 120, X: 130, Y: 320, Z: 110, AA: 110,
});

write(input, "A1:F1", [["Вводные по выбранной заявке", "", "", "", "", ""]]);
styleTitle(input, "A1:F1");
write(input, "A3:C24", [
  ["Поле", "Значение", "Комментарий"],
  ["request_id", "REQ-0001", "ID заявки из листа 01"],
  ["client_name", "Андрей", ""],
  ["phone", "+7 900 000 00 00", ""],
  ["city_or_location", "Екатеринбург", "Нужно для логистики и прайса"],
  ["object_type", "terrace", "terrace/veranda/canopy/porch/extension"],
  ["work_type", "new_build", ""],
  ["calculation_mode", "manual_input", ""],
  ["length_m", 6, "м"],
  ["width_m", 4, "м"],
  ["height_m", 0.8, "м, если известно"],
  ["area_m2", "=B11*B12", "расчет по длине и ширине"],
  ["roof_required", false, ""],
  ["roof_area_m2", 0, "если кровли нет — 0"],
  ["glazing_required", false, ""],
  ["glazing_area_m2", 0, "если остекления нет — 0"],
  ["foundation_type", "unknown", "если unknown — точную цену не давать"],
  ["deck_material", "wpc", "larch/wpc/pine/unknown"],
  ["access_complexity", "medium", "simple/medium/complex"],
  ["urgency", "normal", "normal/urgent/flexible"],
  ["missing_data", "foundation_type", ""],
  ["risk_flags", "unknown_foundation", ""],
]);
styleHeader(input, "A3:C3");
styleBody(input, "A4:C24");
input.getRange("B11:B16").setNumberFormat("0.00");
input.getRange("B14:B16").setNumberFormat("0.00");
input.getRange("B4:B24").format.fill = { color: theme.yellowSoft };
setWidths(input, { A: 190, B: 180, C: 420, D: 40, E: 40, F: 40 });
freeze(input, 3);

const priceHeaders = ["code", "category", "name", "unit", "base_price", "markup_percent", "client_price", "source", "checked_at", "region", "active", "comment"];
const materialsRows = [
  ["MAT_DECK_LARCH", "Настил", "Террасная доска лиственница", "м2", 4200, 0.25, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, "Заменить на актуальную цену"],
  ["MAT_DECK_WPC", "Настил", "Террасная доска ДПК", "м2", 5200, 0.25, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, "Зависит от производителя"],
  ["MAT_TIMBER_50_150", "Каркас", "Пиломатериал 50x150", "м3", 24500, 0.22, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["MAT_TIMBER_50_200", "Кровля", "Пиломатериал 50x200", "м3", 25500, 0.22, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["MAT_ROOF_METAL", "Кровля", "Металлочерепица", "м2", 1100, 0.25, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["MAT_ROOF_POLYCARB", "Кровля", "Поликарбонат", "м2", 1500, 0.25, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["MAT_MEMBRANE_HYDRO", "Кровля", "Гидроизоляционная мембрана", "м2", 120, 0.25, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["MAT_FASTENER_DECK", "Расходники", "Крепеж настила", "м2", 450, 0.25, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["MAT_RAILING_WOOD", "Ограждение", "Деревянное ограждение", "пог.м", 3500, 0.25, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["MAT_GLAZING_COLD", "Остекление", "Холодное остекление", "м2", 9500, 0.18, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, "Требует размеров проемов"],
];
write(materials, "A1:L1", [priceHeaders]);
write(materials, `A2:L${materialsRows.length + 1}`, materialsRows);
formulas(materials, `G2:G${materialsRows.length + 1}`, materialsRows.map((_, i) => [`=IF(E${i + 2}="",0,E${i + 2}*(1+F${i + 2}))`]));
styleHeader(materials, "A1:L1");
styleBody(materials, `A2:L${materialsRows.length + 1}`);
materials.getRange("E:G").setNumberFormat('#,##0 "₽"');
materials.getRange("F:F").setNumberFormat("0%");
materials.getRange("I:I").setNumberFormat("yyyy-mm-dd");
freeze(materials, 1);
setWidths(materials, { A: 155, B: 120, C: 260, D: 70, E: 110, F: 105, G: 115, H: 100, I: 110, J: 130, K: 75, L: 260 });

const worksRows = [
  ["WORK_FRAME_M2", "Каркас", "Монтаж каркаса", "м2", 1800, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["WORK_DECK_M2", "Настил", "Монтаж террасной доски", "м2", 1600, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["WORK_ROOF_FRAME_M2", "Кровля", "Монтаж стропильной системы", "м2", 2100, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["WORK_ROOF_COVER_M2", "Кровля", "Монтаж кровельного покрытия", "м2", 1200, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["WORK_PILE_BORE", "Фундамент", "Устройство буронабивной сваи", "шт", 6500, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["WORK_PILE_SCREW", "Фундамент", "Монтаж винтовой сваи", "шт", 5200, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["WORK_RAILING_M", "Ограждение", "Монтаж ограждения", "пог.м", 1500, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["WORK_STAIRS_STEP", "Лестница", "Монтаж ступени", "шт", 1800, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["WORK_GLAZING_M2", "Остекление", "Монтаж остекления", "м2", 1800, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, "Если не входит в цену подрядчика"],
  ["WORK_DEMOLITION_HOUR", "Демонтаж", "Демонтажные работы", "час", 1200, 0.15, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, "Считать после фото/осмотра"],
];
write(works, "A1:L1", [priceHeaders]);
write(works, `A2:L${worksRows.length + 1}`, worksRows);
formulas(works, `G2:G${worksRows.length + 1}`, worksRows.map((_, i) => [`=IF(E${i + 2}="",0,E${i + 2}*(1+F${i + 2}))`]));
styleHeader(works, "A1:L1");
styleBody(works, `A2:L${worksRows.length + 1}`);
works.getRange("E:G").setNumberFormat('#,##0 "₽"');
works.getRange("F:F").setNumberFormat("0%");
works.getRange("I:I").setNumberFormat("yyyy-mm-dd");
freeze(works, 1);
setWidths(works, { A: 155, B: 120, C: 270, D: 70, E: 110, F: 105, G: 115, H: 100, I: 110, J: 130, K: 75, L: 260 });

const logisticsRows = [
  ["LOG_DELIVERY_CITY", "Логистика", "Доставка по городу", "рейс", 4500, 0.10, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["LOG_DELIVERY_KM", "Логистика", "Доставка за город", "км", 80, 0.10, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["LOG_UNLOADING", "Логистика", "Разгрузка", "рейс", 3500, 0.10, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["LOG_WASTE_REMOVAL", "Логистика", "Вывоз мусора", "рейс", 5500, 0.10, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["CONS_TOOLS", "Расходники", "Износ инструмента и мелкий расход", "объект", 3500, 0.10, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
  ["CONS_FASTENERS", "Расходники", "Крепеж и расходные материалы", "объект", 5000, 0.10, null, "пример", new Date("2026-04-24"), "Екатеринбург", true, ""],
];
write(logistics, "A1:L1", [priceHeaders]);
write(logistics, `A2:L${logisticsRows.length + 1}`, logisticsRows);
formulas(logistics, `G2:G${logisticsRows.length + 1}`, logisticsRows.map((_, i) => [`=IF(E${i + 2}="",0,E${i + 2}*(1+F${i + 2}))`]));
styleHeader(logistics, "A1:L1");
styleBody(logistics, `A2:L${logisticsRows.length + 1}`);
logistics.getRange("E:G").setNumberFormat('#,##0 "₽"');
logistics.getRange("F:F").setNumberFormat("0%");
logistics.getRange("I:I").setNumberFormat("yyyy-mm-dd");
freeze(logistics, 1);
setWidths(logistics, { A: 155, B: 120, C: 290, D: 70, E: 110, F: 105, G: 115, H: 100, I: 110, J: 130, K: 75, L: 260 });

const normsRows = [
  ["N_WASTE_DECK", "Запас", "Запас настила", "%", 0.10, 0.05, 0.15, "materials", "Запас на подрезку"],
  ["N_WASTE_ROOF", "Запас", "Запас кровли", "%", 0.10, 0.05, 0.20, "materials", "Зависит от формы кровли"],
  ["N_MEMBRANE_OVERLAP", "Запас", "Нахлест мембраны", "%", 0.10, 0.05, 0.15, "materials", "Для пленок/мембран"],
  ["N_FRAME_TIMBER_M3_PER_M2", "Норма", "Пиломатериал каркаса на м2", "м3/м2", 0.035, 0.02, 0.06, "materials", "Предварительная норма"],
  ["N_ROOF_TIMBER_M3_PER_M2", "Норма", "Пиломатериал кровли на м2", "м3/м2", 0.025, 0.015, 0.05, "materials", "Предварительная норма"],
  ["N_COMPLEX_ACCESS", "Коэффициент", "Сложный доступ", "коэф.", 1.15, 1.00, 1.35, "works", "Узкий проход, нет подъезда"],
  ["N_MEDIUM_ACCESS", "Коэффициент", "Средний доступ", "коэф.", 1.05, 1.00, 1.20, "works", "Обычная осторожная надбавка"],
  ["N_URGENT", "Коэффициент", "Срочность", "коэф.", 1.20, 1.00, 1.40, "works", "Сжатые сроки"],
  ["N_CONTINGENCY", "Финансы", "Резерв на непредвиденное", "%", 0.07, 0.03, 0.12, "total", "Для предварительной сметы"],
];
write(norms, "A1:I1", [["code", "category", "name", "unit", "default_value", "min_value", "max_value", "apply_to", "comment"]]);
write(norms, `A2:I${normsRows.length + 1}`, normsRows);
styleHeader(norms, "A1:I1");
styleBody(norms, `A2:I${normsRows.length + 1}`);
norms.getRange("E:G").setNumberFormat("0.000");
freeze(norms, 1);
setWidths(norms, { A: 210, B: 120, C: 260, D: 80, E: 100, F: 90, G: 90, H: 100, I: 330 });

write(calc, "A1:L1", [["Расчет по выбранной заявке", "", "", "", "", "", "", "", "", "", "", ""]]);
styleTitle(calc, "A1:L1");
write(calc, "A3:B13", [
  ["Параметр", "Значение"],
  ["request_id", "='02_Вводные_по_заявке'!B4"],
  ["object_type", "='02_Вводные_по_заявке'!B9"],
  ["area_m2", "='02_Вводные_по_заявке'!B14"],
  ["roof_area_m2", "='02_Вводные_по_заявке'!B16"],
  ["glazing_area_m2", "='02_Вводные_по_заявке'!B18"],
  ["foundation_type", "='02_Вводные_по_заявке'!B19"],
  ["deck_material", "='02_Вводные_по_заявке'!B20"],
  ["access_complexity", "='02_Вводные_по_заявке'!B21"],
  ["complexity_coefficient", ""],
  ["contingency_percent", "=VLOOKUP(\"N_CONTINGENCY\",'06_Нормы_коэффициенты'!A:E,5,FALSE)"],
]);
styleHeader(calc, "A3:B3");
styleBody(calc, "A4:B13");
formulas(calc, "B4:B13", [
  ["='02_Вводные_по_заявке'!B4"],
  ["='02_Вводные_по_заявке'!B9"],
  ["='02_Вводные_по_заявке'!B14"],
  ["='02_Вводные_по_заявке'!B16"],
  ["='02_Вводные_по_заявке'!B18"],
  ["='02_Вводные_по_заявке'!B19"],
  ["='02_Вводные_по_заявке'!B20"],
  ["='02_Вводные_по_заявке'!B21"],
  ["=IF(B11=\"complex\",VLOOKUP(\"N_COMPLEX_ACCESS\",'06_Нормы_коэффициенты'!A:E,5,FALSE),IF(B11=\"medium\",VLOOKUP(\"N_MEDIUM_ACCESS\",'06_Нормы_коэффициенты'!A:E,5,FALSE),1))"],
  ["=VLOOKUP(\"N_CONTINGENCY\",'06_Нормы_коэффициенты'!A:E,5,FALSE)"],
]);
calc.getRange("B6:B8").setNumberFormat("0.00");
calc.getRange("B12").setNumberFormat("0.00");
calc.getRange("B13").setNumberFormat("0%");

const calcHeaders = ["section", "item", "price_code", "type", "qty", "unit", "unit_price", "coefficient", "amount", "include", "confidence", "comment"];
const calcRows = [
  ["Настил", "Террасная доска ДПК", "MAT_DECK_WPC", "material", null, "м2", null, 1, null, true, "medium", "Площадь настила + запас"],
  ["Настил", "Крепеж настила", "MAT_FASTENER_DECK", "material", null, "м2", null, 1, null, true, "medium", "По площади настила"],
  ["Каркас", "Пиломатериал каркаса", "MAT_TIMBER_50_150", "material", null, "м3", null, 1, null, true, "low", "Предварительная норма, если нет спецификации"],
  ["Каркас", "Монтаж каркаса", "WORK_FRAME_M2", "work", null, "м2", null, null, null, true, "medium", "По площади настила"],
  ["Настил", "Монтаж настила", "WORK_DECK_M2", "work", null, "м2", null, null, null, true, "medium", "По площади настила"],
  ["Кровля", "Металлочерепица", "MAT_ROOF_METAL", "material", null, "м2", null, 1, null, false, "low", "Включить, если roof_area_m2 > 0"],
  ["Кровля", "Мембрана", "MAT_MEMBRANE_HYDRO", "material", null, "м2", null, 1, null, false, "low", "Включить, если есть кровля"],
  ["Кровля", "Монтаж кровли", "WORK_ROOF_COVER_M2", "work", null, "м2", null, null, null, false, "low", "Включить, если есть кровля"],
  ["Остекление", "Холодное остекление", "MAT_GLAZING_COLD", "material", null, "м2", null, 1, null, false, "low", "Требует размеров проемов"],
  ["Фундамент", "Винтовые сваи", "WORK_PILE_SCREW", "work", 0, "шт", null, null, null, false, "low", "Не включено: фундамент неизвестен"],
  ["Логистика", "Доставка по городу", "LOG_DELIVERY_CITY", "logistics", 1, "рейс", null, 1, null, true, "medium", "Предварительно"],
  ["Расходники", "Инструмент и мелкий расход", "CONS_TOOLS", "logistics", 1, "объект", null, 1, null, true, "medium", "Предварительно"],
];
write(calc, "A16:L16", [calcHeaders]);
write(calc, `A17:L${calcRows.length + 16}`, calcRows);
styleHeader(calc, "A16:L16");
styleBody(calc, `A17:L${calcRows.length + 16}`);

const start = 17;
const end = calcRows.length + 16;
const qtyFormulas = calcRows.map((row, idx) => {
  const r = start + idx;
  const code = row[2];
  if (code === "MAT_DECK_WPC") return [`=$B$6*(1+VLOOKUP("N_WASTE_DECK",'06_Нормы_коэффициенты'!$A:$E,5,FALSE))`];
  if (code === "MAT_FASTENER_DECK") return [`=$B$6`];
  if (code === "MAT_TIMBER_50_150") return [`=$B$6*VLOOKUP("N_FRAME_TIMBER_M3_PER_M2",'06_Нормы_коэффициенты'!$A:$E,5,FALSE)`];
  if (["WORK_FRAME_M2", "WORK_DECK_M2"].includes(code)) return [`=$B$6`];
  if (code === "MAT_ROOF_METAL") return [`=$B$7*(1+VLOOKUP("N_WASTE_ROOF",'06_Нормы_коэффициенты'!$A:$E,5,FALSE))`];
  if (code === "MAT_MEMBRANE_HYDRO") return [`=$B$7*(1+VLOOKUP("N_MEMBRANE_OVERLAP",'06_Нормы_коэффициенты'!$A:$E,5,FALSE))`];
  if (code === "WORK_ROOF_COVER_M2") return [`=$B$7`];
  if (code === "MAT_GLAZING_COLD") return [`=$B$8`];
  return [row[4]];
});
formulas(calc, `E${start}:E${end}`, qtyFormulas);
const unitPriceFormulas = calcRows.map((_, idx) => {
  const r = start + idx;
  return [`=IF(D${r}="material",IFERROR(VLOOKUP(C${r},'03_Прайс_материалы'!$A:$G,7,FALSE),0),IF(D${r}="work",IFERROR(VLOOKUP(C${r},'04_Прайс_работы'!$A:$G,7,FALSE),0),IF(D${r}="logistics",IFERROR(VLOOKUP(C${r},'05_Расходники_логистика'!$A:$G,7,FALSE),0),0)))`];
});
formulas(calc, `G${start}:G${end}`, unitPriceFormulas);
const coefficientFormulas = calcRows.map((_, idx) => {
  const r = start + idx;
  return [`=IF(D${r}="work",$B$12,1)`];
});
formulas(calc, `H${start}:H${end}`, coefficientFormulas);
const amountFormulas = calcRows.map((_, idx) => {
  const r = start + idx;
  return [`=IF(J${r}=TRUE,E${r}*G${r}*H${r},0)`];
});
formulas(calc, `I${start}:I${end}`, amountFormulas);
calc.getRange(`E${start}:E${end}`).setNumberFormat("0.00");
calc.getRange(`G${start}:I${end}`).setNumberFormat('#,##0 "₽"');
calc.getRange(`H${start}:H${end}`).setNumberFormat("0.00");

write(calc, "N16:O24", [
  ["Итоговый блок", "Сумма"],
  ["Материалы", ""],
  ["Работы", ""],
  ["Логистика/расходники", ""],
  ["Подытог", ""],
  ["Резерв", ""],
  ["Итого предварительно", ""],
  ["Непроверенных цен", ""],
  ["Проверка менеджера", ""],
]);
styleHeader(calc, "N16:O16");
styleBody(calc, "N17:O24");
formulas(calc, "O17:O24", [
  [`=SUMIF(D${start}:D${end},"material",I${start}:I${end})`],
  [`=SUMIF(D${start}:D${end},"work",I${start}:I${end})`],
  [`=SUMIF(D${start}:D${end},"logistics",I${start}:I${end})`],
  ["=SUM(O17:O19)"],
  ["=O20*$B$13"],
  ["=O20+O21"],
  [`=COUNTIF(G${start}:G${end},0)`],
  ["=IF(OR(O23>0,$B$9=\"unknown\"),\"Да\",\"Нет\")"],
]);
calc.getRange("O17:O22").setNumberFormat('#,##0 "₽"');
calc.getRange("O23").setNumberFormat("0");
calc.getRange("N22:O22").format.fill = { color: theme.greenSoft };
calc.getRange("N24:O24").format.fill = { color: theme.yellowSoft };
setWidths(calc, { A: 105, B: 230, C: 155, D: 90, E: 90, F: 70, G: 110, H: 95, I: 120, J: 80, K: 95, L: 310, M: 30, N: 210, O: 150 });
freeze(calc, 16);

write(client, "A1:C1", [["Клиентская версия сметы", "", ""]]);
styleTitle(client, "A1:C1");
write(client, "A3:C10", [
  ["Раздел", "Сумма", "Комментарий"],
  ["Материалы", "", "Подтягивается из расчета"],
  ["Работы", "", "С учетом коэффициента сложности"],
  ["Логистика и расходники", "", "Предварительно"],
  ["Резерв", "", "На непредвиденные и уточняемые позиции"],
  ["Итого предварительно", "", "Не является финальной коммерческой ценой"],
  ["Требует проверки менеджера", "", "Да, если есть непроверенные цены или неизвестный фундамент"],
  ["Условия/ограничения", "", "Финальная цена после проверки материалов, фундамента, доступа и актуальных цен"],
]);
styleHeader(client, "A3:C3");
styleBody(client, "A4:C10");
formulas(client, "B4:B9", [
  ["='07_Расчет'!O17"],
  ["='07_Расчет'!O18"],
  ["='07_Расчет'!O19"],
  ["='07_Расчет'!O21"],
  ["='07_Расчет'!O22"],
  ["='07_Расчет'!O24"],
]);
client.getRange("B4:B8").setNumberFormat('#,##0 "₽"');
client.getRange("A8:C8").format.fill = { color: theme.greenSoft };
client.getRange("A9:C9").format.fill = { color: theme.yellowSoft };
write(client, "A13:C16", [
  ["Текст для клиента", "", ""],
  ["Это предварительный расчет по указанным вводным. Финальная стоимость зависит от подтверждения материалов, фундамента, доступа к участку, доставки и актуальных цен.", "", ""],
  ["Если в расчете есть непроверенные позиции, перед отправкой финальной сметы их должен проверить специалист.", "", ""],
  ["Следующий шаг: уточнить фундамент и подтвердить состав работ.", "", ""],
]);
styleSubtitle(client, "A13:C13");
styleBody(client, "A14:C16");
setWidths(client, { A: 240, B: 160, C: 520 });

const managerRows = [
  ["request_id", "check_item", "status", "comment", "responsible", "checked_at"],
  ["REQ-0001", "Размеры подтверждены", "ok", "6 × 4 м со слов клиента", "", ""],
  ["REQ-0001", "Фундамент выбран/проверен", "needs_clarification", "Фундамент неизвестен", "", ""],
  ["REQ-0001", "Материалы выбраны", "ok", "ДПК", "", ""],
  ["REQ-0001", "Кровля проверена", "not_applicable", "Кровля не требуется", "", ""],
  ["REQ-0001", "Остекление проверено", "not_applicable", "Остекление не требуется", "", ""],
  ["REQ-0001", "Доставка учтена", "todo", "Пока городская доставка", "", ""],
  ["REQ-0001", "Доступ к объекту учтен", "needs_clarification", "Доступ medium, уточнить", "", ""],
  ["REQ-0001", "Цены актуальны", "needs_clarification", "Цены демонстрационные", "", ""],
  ["REQ-0001", "Альтернативы не смешаны", "ok", "Один вариант", "", ""],
  ["REQ-0001", "Клиентская версия готова", "todo", "После проверки цен и фундамента", "", ""],
];
write(manager, "A1:F11", managerRows);
styleHeader(manager, "A1:F1");
styleBody(manager, "A2:F11");
manager.getRange("C2:C11").dataValidation = { rule: { type: "list", values: ["todo", "ok", "needs_clarification", "not_applicable"] } };
manager.getRange("C:C").format.columnWidthPx = 160;
setWidths(manager, { A: 95, B: 260, C: 160, D: 420, E: 130, F: 140 });
freeze(manager, 1);

write(refs, "A1:L1", [["object_type", "work_type", "calculation_mode", "foundation_type", "deck_material", "roof_material", "glazing_type", "access_complexity", "urgency", "estimate_confidence", "lead_status", "manager_status"]]);
const refRows = [
  ["terrace", "new_build", "manual_input", "screw_piles", "larch", "metal_tile", "cold", "simple", "normal", "high", "new", "new"],
  ["veranda", "repair", "project_pdf", "bored_piles", "wpc", "profiled_sheet", "warm", "medium", "urgent", "medium", "incomplete", "in_progress"],
  ["canopy", "reconstruction", "project_with_changes", "concrete_slab", "pine", "soft_roof", "sliding", "complex", "flexible", "low", "qualified", "waiting_client"],
  ["porch", "demolition", "estimate_review", "existing_base", "unknown", "polycarbonate", "none", "unknown", "", "", "hot", "estimated"],
  ["extension", "estimate_check", "insufficient_data", "unknown", "other", "unknown", "unknown", "", "", "", "needs_review", "sent_to_client"],
  ["other", "", "", "other", "", "none", "other", "", "", "", "lost", "closed_won"],
];
write(refs, "A2:L7", refRows);
styleHeader(refs, "A1:L1");
styleBody(refs, "A2:L20");
setWidths(refs, { A: 130, B: 130, C: 170, D: 160, E: 150, F: 150, G: 150, H: 150, I: 120, J: 150, K: 130, L: 140 });

write(log, "A1:G1", [["changed_at", "changed_by", "sheet", "field", "old_value", "new_value", "reason"]]);
write(log, "A2:G2", [[new Date("2026-04-24T15:00:00"), "Codex", "Workbook", "initial_version", "", "MVP v1", "Создан первичный шаблон нейро-сметчика"]]);
styleHeader(log, "A1:G1");
styleBody(log, "A2:G20");
log.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm");
setWidths(log, { A: 140, B: 110, C: 160, D: 160, E: 180, F: 180, G: 360 });

for (const sh of [input, leads]) {
  // Lightweight validations on editable MVP fields.
  try {
    if (sh === input) {
      input.getRange("B9").dataValidation = { rule: { type: "list", values: ["terrace", "veranda", "canopy", "porch", "extension", "other"] } };
      input.getRange("B19").dataValidation = { rule: { type: "list", values: ["screw_piles", "bored_piles", "concrete_slab", "existing_base", "unknown", "other"] } };
      input.getRange("B20").dataValidation = { rule: { type: "list", values: ["larch", "wpc", "pine", "unknown", "other"] } };
      input.getRange("B21").dataValidation = { rule: { type: "list", values: ["simple", "medium", "complex", "unknown"] } };
    }
  } catch {
    // Data validation is helpful but not critical.
  }
}

// Compact visual verification pass: render all sheets once. Save small previews for QA only.
await fs.mkdir(outputDir, { recursive: true });
for (const sh of [
  "00_README",
  "01_Заявки",
  "02_Вводные_по_заявке",
  "03_Прайс_материалы",
  "04_Прайс_работы",
  "05_Расходники_логистика",
  "06_Нормы_коэффициенты",
  "07_Расчет",
  "08_Смета_для_клиента",
  "09_Проверка_менеджера",
  "10_Справочники",
  "11_Лог_изменений",
]) {
  const preview = await wb.render({ sheetName: sh, autoCrop: "all", scale: 1, format: "png" });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  if (bytes.length < 1000) {
    throw new Error(`Rendered preview for ${sh} looks unexpectedly small`);
  }
}

const formulaErrors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});

const calcInspect = await wb.inspect({
  kind: "table",
  range: "07_Расчет!N16:O24",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 4,
});

const exported = await SpreadsheetFile.exportXlsx(wb);
await exported.save(outputPath);

console.log(JSON.stringify({
  outputPath,
  formulaErrors: formulaErrors.ndjson,
  calcSummary: calcInspect.ndjson,
}, null, 2));
