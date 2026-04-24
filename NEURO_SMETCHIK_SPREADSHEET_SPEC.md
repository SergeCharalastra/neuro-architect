# Спецификация расчетной таблицы нейро-сметчика

## 1. Назначение

Эта спецификация описывает Google Sheets / Excel-таблицу для нейро-сметчика.

Таблица нужна, чтобы:

- принимать структурированные данные из NeuroAgents
- хранить прайс материалов и работ
- считать предварительную смету
- отделять расчет от фантазий ИИ
- показывать менеджеру спорные места
- формировать клиентскую версию сметы

Главный принцип:

> Агент собирает данные. Таблица считает. Менеджер проверяет. Клиент получает только проверенный или явно предварительный результат.

## 2. Архитектура таблицы

Рекомендуемая структура листов:

```text
00_README
01_Заявки
02_Вводные_по_заявке
03_Прайс_материалы
04_Прайс_работы
05_Расходники_логистика
06_Нормы_коэффициенты
07_Расчет
08_Смета_для_клиента
09_Проверка_менеджера
10_Справочники
11_Лог_изменений
```

Для MVP можно начать с 6 листов:

```text
01_Заявки
03_Прайс_материалы
04_Прайс_работы
05_Расходники_логистика
06_Нормы_коэффициенты
07_Расчет
```

## 3. Лист `00_README`

Назначение:

- объяснить структуру таблицы
- зафиксировать правила использования
- предупредить о предварительном характере расчета

Содержание:

```text
Эта таблица используется для предварительного расчета смет по террасам, верандам, навесам, крыльцу и смежным наружным работам.

Правила:
1. Не отправлять клиенту финальную стоимость без проверки менеджера.
2. Если цена равна 0 или не проверена, позицию считать непроверенной.
3. Альтернативные варианты считать отдельно.
4. Сложные объекты передавать специалисту.
5. Все спорные места фиксировать в листе "09_Проверка_менеджера".
```

## 4. Лист `01_Заявки`

Назначение:

- хранить все заявки из NeuroAgents
- быть входной точкой для CRM/n8n/API
- давать менеджеру общий список лидов

### Колонки

```text
request_id
created_at
source
client_name
phone
city_or_location
object_type
object_type_raw
work_type
calculation_mode
length_m
width_m
area_m2
foundation_type
deck_material
roof_required
glazing_required
has_project_file
access_complexity
urgency
missing_data
risk_flags
estimate_confidence
next_step
manager_comment
lead_status
manager_status
```

### Пример строки

```text
REQ-0001
2026-04-24 15:00
Telegram
Андрей
+7 900 000 00 00
Екатеринбург
terrace
терраса к дому
new_build
manual_input
6
4
24
unknown
wpc
false
false
false
medium
normal
foundation_type
unknown_foundation
medium
manager_call
Клиент хочет террасу 24 м2, фундамент не выбран, нужен звонок.
qualified
new
```

### Статусы `lead_status`

```text
new
incomplete
qualified
hot
needs_review
lost
```

### Статусы `manager_status`

```text
new
in_progress
waiting_client
estimated
sent_to_client
closed_won
closed_lost
```

## 5. Лист `02_Вводные_по_заявке`

Назначение:

- детально раскрывать одну выбранную заявку
- использоваться как форма для ручного ввода или проверки

### Блоки

```text
Клиент
Локация
Объект
Размеры
Состав работ
Фундамент
Материалы
Условия участка
Проект/файлы
Недостающие данные
Риски
```

### Поля

```text
request_id
client_name
phone
city_or_location
object_type
work_type
calculation_mode
length_m
width_m
height_m
area_m2
roof_area_m2
glazing_area_m2
foundation_type
deck_material
frame_material
roof_material
glazing_type
foundation_required
roof_required
glazing_required
railing_required
stairs_required
demolition_required
access_complexity
urgency
missing_data
risk_flags
estimate_confidence
manager_comment
```

## 6. Лист `03_Прайс_материалы`

Назначение:

- хранить цены материалов
- отделить цены от промпта агента
- позволить обновлять прайс без изменения сценария

### Колонки

```text
code
category
name
unit
base_price
markup_percent
client_price
source
checked_at
region
active
comment
```

### Формула `client_price`

```excel
=IF(E2="",0,E2*(1+F2))
```

### Пример позиций

```text
MAT_DECK_LARCH | Настил | Террасная доска лиственница | м2
MAT_DECK_WPC | Настил | Террасная доска ДПК | м2
MAT_TIMBER_50_150 | Каркас | Доска/брус 50x150 | м3
MAT_TIMBER_50_200 | Кровля | Стропила 50x200 | м3
MAT_ROOF_METAL | Кровля | Металлочерепица | м2
MAT_ROOF_POLYCARB | Кровля | Поликарбонат | м2
MAT_MEMBRANE_HYDRO | Кровля | Гидроизоляционная мембрана | м2
MAT_FASTENER_DECK | Расходники | Крепеж настила | м2
MAT_RAILING_WOOD | Ограждение | Деревянное ограждение | пог.м
MAT_GLAZING_COLD | Остекление | Холодное остекление | м2
```

### Правило

Если `base_price = 0` или `active = false`, позиция считается непроверенной.

## 7. Лист `04_Прайс_работы`

Назначение:

- хранить ставки работ
- считать работы отдельно от материалов

### Колонки

```text
code
category
name
unit
base_price
markup_percent
client_price
source
checked_at
region
active
comment
```

### Пример позиций

```text
WORK_FRAME_M2 | Каркас | Монтаж каркаса | м2
WORK_DECK_M2 | Настил | Монтаж террасной доски | м2
WORK_ROOF_FRAME_M2 | Кровля | Монтаж стропильной системы | м2
WORK_ROOF_COVER_M2 | Кровля | Монтаж кровельного покрытия | м2
WORK_PILE_BORE | Фундамент | Устройство буронабивной сваи | шт
WORK_PILE_SCREW | Фундамент | Монтаж винтовой сваи | шт
WORK_RAILING_M | Ограждение | Монтаж ограждения | пог.м
WORK_STAIRS_STEP | Лестница | Монтаж ступени | шт
WORK_GLAZING_M2 | Остекление | Монтаж остекления | м2
WORK_DEMOLITION_HOUR | Демонтаж | Демонтажные работы | час
```

## 8. Лист `05_Расходники_логистика`

Назначение:

- учитывать доставку, разгрузку, инструмент, мусор и мелкие расходы

### Колонки

```text
code
category
name
unit
base_price
markup_percent
client_price
source
checked_at
region
active
comment
```

### Пример позиций

```text
LOG_DELIVERY_CITY | Логистика | Доставка по городу | рейс
LOG_DELIVERY_KM | Логистика | Доставка за город | км
LOG_UNLOADING | Логистика | Разгрузка | рейс
LOG_WASTE_REMOVAL | Логистика | Вывоз мусора | рейс
CONS_TOOLS | Расходники | Износ инструмента и мелкий расход | объект
CONS_FASTENERS | Расходники | Крепеж и расходные материалы | объект
CONS_PROTECTION | Расходники | Защитные материалы/пленки | объект
```

## 9. Лист `06_Нормы_коэффициенты`

Назначение:

- хранить нормы расхода
- хранить запасы
- хранить коэффициенты сложности

### Колонки

```text
code
category
name
unit
default_value
min_value
max_value
apply_to
comment
```

### Пример норм

```text
N_WASTE_DECK | Запас | Запас настила | % | 0.10 | 0.05 | 0.15 | materials | Запас на подрезку
N_WASTE_ROOF | Запас | Запас кровли | % | 0.10 | 0.05 | 0.20 | materials | Зависит от формы кровли
N_MEMBRANE_OVERLAP | Запас | Нахлест мембраны | % | 0.10 | 0.05 | 0.15 | materials | Для пленок/мембран
N_FRAME_TIMBER_M3_PER_M2 | Норма | Пиломатериал каркаса на м2 | м3/м2 | 0.035 | 0.02 | 0.06 | materials | Предварительная норма
N_ROOF_TIMBER_M3_PER_M2 | Норма | Пиломатериал кровли на м2 | м3/м2 | 0.025 | 0.015 | 0.05 | materials | Предварительная норма
N_COMPLEX_ACCESS | Коэффициент | Сложный доступ | коэф. | 1.15 | 1.00 | 1.35 | works | Узкий проход, нет подъезда
N_URGENT | Коэффициент | Срочность | коэф. | 1.20 | 1.00 | 1.40 | works | Сжатые сроки
N_CONTINGENCY | Финансы | Резерв на непредвиденное | % | 0.07 | 0.03 | 0.12 | total | Для предварительной сметы
```

## 10. Лист `07_Расчет`

Назначение:

- считать смету по выбранной заявке
- подтягивать цены из прайса
- показывать менеджеру, что включено

### Верхний блок

```text
request_id
object_type
area_m2
roof_area_m2
glazing_area_m2
foundation_type
deck_material
complexity_coefficient
contingency_percent
```

### Расчетная таблица

Колонки:

```text
section
item
price_code
type
qty
unit
unit_price
coefficient
amount
include
confidence
comment
```

### Пример строк

```text
Настил | Террасная доска лиственница | MAT_DECK_LARCH | material | area_m2*(1+N_WASTE_DECK) | м2
Настил | Крепеж настила | MAT_FASTENER_DECK | material | area_m2 | м2
Каркас | Пиломатериал каркаса | MAT_TIMBER_50_150 | material | area_m2*N_FRAME_TIMBER_M3_PER_M2 | м3
Каркас | Монтаж каркаса | WORK_FRAME_M2 | work | area_m2 | м2
Настил | Монтаж настила | WORK_DECK_M2 | work | area_m2 | м2
Кровля | Металлочерепица | MAT_ROOF_METAL | material | roof_area_m2*(1+N_WASTE_ROOF) | м2
Кровля | Монтаж кровли | WORK_ROOF_COVER_M2 | work | roof_area_m2 | м2
Остекление | Холодное остекление | MAT_GLAZING_COLD | material | glazing_area_m2 | м2
Фундамент | Винтовые сваи | WORK_PILE_SCREW | work | pile_count | шт
Логистика | Доставка по городу | LOG_DELIVERY_CITY | logistics | 1 | рейс
```

### Формула суммы

```excel
=IF(J2=TRUE,E2*G2*H2,0)
```

Где:

- `E2` — количество
- `G2` — цена за единицу
- `H2` — коэффициент
- `J2` — включать позицию или нет

### Подтягивание цены

Для материалов:

```excel
=IFERROR(VLOOKUP(C2,'03_Прайс_материалы'!A:G,7,FALSE),0)
```

Для работ:

```excel
=IFERROR(VLOOKUP(C2,'04_Прайс_работы'!A:G,7,FALSE),0)
```

Для логистики:

```excel
=IFERROR(VLOOKUP(C2,'05_Расходники_логистика'!A:G,7,FALSE),0)
```

## 11. Итоговый блок расчета

Поля:

```text
materials_total
works_total
logistics_total
subtotal
contingency
preliminary_total
unchecked_positions_count
manager_review_required
```

Формулы:

```excel
materials_total = SUMIF(type_range,"material",amount_range)
works_total = SUMIF(type_range,"work",amount_range)
logistics_total = SUMIF(type_range,"logistics",amount_range)
subtotal = materials_total + works_total + logistics_total
contingency = subtotal * contingency_percent
preliminary_total = subtotal + contingency
unchecked_positions_count = COUNTIF(unit_price_range,0)
manager_review_required = IF(unchecked_positions_count>0,"Да","Нет")
```

Правило:

> Если `unchecked_positions_count > 0`, клиенту нельзя отправлять сумму как готовую смету.

## 12. Лист `08_Смета_для_клиента`

Назначение:

- сформировать понятный вывод для клиента
- убрать технические коды
- показать предварительный характер расчета

### Колонки

```text
section
amount
comment
```

### Разделы

```text
Материалы
Работы
Логистика и расходники
Резерв
Итого предварительно
Что не входит / требует уточнения
```

### Текст для клиента

```text
Это предварительный расчет по указанным вводным. Финальная стоимость зависит от подтверждения материалов, фундамента, доступа к участку, доставки и актуальных цен.
```

Если есть непроверенные позиции:

```text
В расчете есть позиции, которые требуют проверки цены или объема. Перед отправкой финальной сметы их должен проверить специалист.
```

## 13. Лист `09_Проверка_менеджера`

Назначение:

- дать менеджеру чек-лист перед отправкой клиенту
- фиксировать спорные места

### Колонки

```text
request_id
check_item
status
comment
responsible
checked_at
```

### Чек-лист

```text
Размеры подтверждены
Фундамент выбран/проверен
Материалы выбраны
Кровля проверена
Остекление проверено
Доставка учтена
Доступ к объекту учтен
Демонтаж учтен
Расходники учтены
Цены актуальны
Резерв применен
Альтернативы не смешаны
Клиентская версия готова
```

### Статусы

```text
todo
ok
needs_clarification
not_applicable
```

## 14. Лист `10_Справочники`

Назначение:

- хранить значения для выпадающих списков

Справочники:

```text
object_type
work_type
calculation_mode
foundation_type
deck_material
roof_material
glazing_type
access_complexity
urgency
estimate_confidence
lead_status
manager_status
```

## 15. Лист `11_Лог_изменений`

Назначение:

- фиксировать изменения прайса, норм и формул

Колонки:

```text
changed_at
changed_by
sheet
field
old_value
new_value
reason
```

Правило:

> Любое изменение прайса или коэффициентов должно иметь дату и причину.

## 16. Минимальная логика для MVP

Для первого запуска достаточно считать:

```text
1. Настил по площади.
2. Каркас по площади.
3. Работы по площади.
4. Фундамент как ручная позиция или неизвестный блок.
5. Логистику как ручную позицию.
6. Резерв.
```

Не пытаться сразу автоматизировать:

- сложные кровли
- теплые пристройки
- инженерные коммуникации
- точный PDF-разбор
- нестандартные фундаменты
- сложное остекление

## 17. Правила качества расчета

Расчет считается пригодным для предварительной оценки, если:

```text
area_m2 заполнено
object_type заполнено
work_type заполнено
материалы понятны или отмечены как unknown
фундамент понятен или отмечен как риск
цены не равны 0 по ключевым позициям
есть комментарий менеджеру
```

Расчет нельзя отправлять клиенту, если:

```text
нет площади
нет состава работ
все ключевые цены равны 0
непонятен тип объекта
есть сложная конструкция без проверки
есть несколько альтернатив в одном расчете
```

## 18. Интеграция с NeuroAgents

Из NeuroAgents в таблицу должны попадать поля из:

```text
NEUROAGENTS_VARIABLES_AND_FIELDS.md
```

Минимально:

```text
client_name
phone
city_or_location
object_type
work_type
calculation_mode
length_m
width_m
area_m2
foundation_type
deck_material
roof_required
glazing_required
has_project_file
missing_data
risk_flags
estimate_confidence
next_step
manager_comment
```

## 19. Рекомендуемый MVP-процесс

```text
1. NeuroAgents собирает заявку.
2. Заявка попадает в лист 01_Заявки.
3. Менеджер выбирает заявку для расчета.
4. Данные подтягиваются в 02_Вводные_по_заявке.
5. 07_Расчет считает предварительную смету.
6. 09_Проверка_менеджера показывает чек-лист.
7. 08_Смета_для_клиента формирует понятный вывод.
8. Менеджер отправляет клиенту проверенную версию.
```

## 20. Следующий практический шаг

Следующий артефакт:

```text
NEURO_SMETCHIK_TABLE_MVP.csv / xlsx
```

Что нужно сделать:

- создать минимальную таблицу
- добавить листы MVP
- добавить базовые позиции прайса
- добавить нормы
- добавить формулы расчета
- добавить клиентский вывод
- протестировать на 3 заявках

Минимальный тест:

```text
Терраса 6 × 4 м, ДПК, фундамент неизвестен, Екатеринбург.
```

Критерий успеха:

- таблица считает только проверяемые позиции
- фундамент отмечен как риск
- клиентский вывод не выглядит как финальная цена
- менеджеру понятно, что нужно уточнить
