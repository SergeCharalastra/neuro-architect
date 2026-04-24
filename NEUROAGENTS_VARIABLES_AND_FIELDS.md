# Переменные и поля для NeuroAgents

## 1. Назначение

Этот документ описывает, какие данные должен собирать нейро-сметчик в `app.neuroagents.pro`, как их называть, какие поля обязательны и куда их передавать.

Цель:

- превратить диалог в структурированную заявку
- упростить передачу в CRM
- подготовить данные для Google Sheets / n8n / HTTP endpoint
- убрать ручную расшифровку переписки
- снизить риск ошибок в смете

Главный принцип:

> Если данные важны для расчета или передачи менеджеру, они должны быть отдельным полем, а не просто текстом в переписке.

## 2. Уровни обязательности

Используем 3 уровня:

```text
required
```

Нужно для любой нормальной заявки.

```text
recommended
```

Желательно собрать, но можно продолжить без этого.

```text
optional
```

Полезно для уточнения или сложных заявок.

## 3. Типы данных

```text
string      — текст
number      — число
boolean     — да/нет
enum        — выбор из списка
date        — дата
array       — список значений
object      — структурированный блок
```

## 4. Минимальный набор для MVP

Эти поля нужны для первого запуска:

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
has_project_file
missing_data
risk_flags
manager_comment
next_step
```

Если нет `object_type`, `work_type`, размеров или состава работ, смету считать нельзя. Можно только собрать заявку и уточнить данные.

## 5. Поля клиента

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `client_name` | string | recommended | Андрей | CRM, карточка заявки | Если клиент не назвал имя, не давить |
| `phone` | string | required для передачи менеджеру | +7 900 000 00 00 | CRM, менеджер | Запрашивать, когда есть смысл передать заявку |
| `messenger` | enum | optional | Telegram | CRM | Канал обращения |
| `contact_preference` | enum | optional | звонок | CRM | звонок / WhatsApp / Telegram / любое |
| `preferred_contact_time` | string | optional | сегодня после 16:00 | CRM | Важно для менеджера |

## 6. Поля локации

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `city_or_location` | string | required | Екатеринбург | CRM, таблица | Нужно для логистики и прайса |
| `address_or_area` | string | optional | Новоалексеевка | CRM | Точный адрес не требовать до реальной заявки |
| `delivery_distance_km` | number | recommended | 25 | таблица | Если известно расстояние от города |
| `access_complexity` | enum | recommended | сложный | таблица, менеджер | простой / средний / сложный |
| `access_comment` | string | optional | узкий проход, нет подъезда | менеджер | Влияет на работы и логистику |

## 7. Поля режима расчета

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `calculation_mode` | enum | required | manual_input | CRM, таблица | manual_input / project_pdf / project_with_changes / estimate_review / insufficient_data |
| `has_project_file` | boolean | required | true | CRM | Есть ли проект, фото, смета |
| `project_file_type` | enum | optional | PDF | CRM | PDF / photo / drawing / screenshot / estimate / none |
| `source_quality` | enum | optional | medium | менеджер | high / medium / low |
| `estimate_confidence` | enum | required | medium | менеджер, CRM | high / medium / low |

## 8. Поля объекта

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `object_type` | enum | required | terrace | CRM, таблица | terrace / veranda / canopy / porch / extension / other |
| `object_type_raw` | string | optional | терраса к дому | CRM | Как сказал клиент |
| `work_type` | enum | required | new_build | CRM | new_build / repair / reconstruction / demolition / estimate_check |
| `object_description` | string | recommended | терраса к дому с ограждением | менеджер | Краткое человеческое описание |
| `is_standard_object` | boolean | optional | true | менеджер | false для пристроек, сложных объектов |

## 9. Размеры

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `length_m` | number | required | 6 | таблица | Длина в метрах |
| `width_m` | number | required | 4 | таблица | Ширина в метрах |
| `height_m` | number | optional | 0.8 | таблица, менеджер | Важно для лестниц, ограждений, навесов |
| `area_m2` | number | required | 24 | таблица | Можно рассчитать из длины и ширины |
| `roof_area_m2` | number | recommended | 30 | таблица | Если есть кровля |
| `glazing_area_m2` | number | recommended | 18 | таблица | Если есть остекление |
| `perimeter_m` | number | optional | 20 | таблица | Может использоваться для ограждений |
| `dimensions_confidence` | enum | recommended | medium | менеджер | exact / approximate / unknown |

Правило:

```text
Если клиент дал длину и ширину, агент может предварительно рассчитать площадь.
Если размеры примерные, нужно указать dimensions_confidence = approximate.
```

## 10. Состав работ

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `foundation_required` | boolean | recommended | true | таблица | Нужен ли фундамент |
| `frame_required` | boolean | recommended | true | таблица | Обычно да |
| `deck_required` | boolean | recommended | true | таблица | Обычно да для террасы |
| `roof_required` | boolean | required | false | таблица | Кровля сильно влияет на стоимость |
| `glazing_required` | boolean | recommended | false | таблица | Для веранды важно |
| `railing_required` | boolean | recommended | true | таблица | Ограждение |
| `stairs_required` | boolean | recommended | true | таблица | Лестница |
| `demolition_required` | boolean | recommended | false | таблица, менеджер | Демонтаж считать отдельно |
| `waste_removal_required` | boolean | optional | true | таблица | Вывоз мусора |
| `gutter_required` | boolean | optional | false | таблица | Для кровли |

## 11. Фундамент

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `foundation_type` | enum | required/recommended | screw_piles | таблица, менеджер | required, если клиент хочет расчет |
| `foundation_type_raw` | string | optional | сваи | CRM | Как сказал клиент |
| `pile_count` | number | optional | 8 | таблица | Если известно |
| `foundation_confidence` | enum | recommended | low | менеджер | high / medium / low |
| `foundation_comment` | string | optional | клиент не знает, нужен выбор специалиста | менеджер | Важно для передачи |

Значения `foundation_type`:

```text
screw_piles
bored_piles
concrete_slab
strip_foundation
grillage
existing_base
column_base
unknown
other
```

Стоп-правило:

```text
Если foundation_type = unknown, точную цену не давать.
```

## 12. Материалы

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `deck_material` | enum | recommended | larch | таблица | Материал настила |
| `frame_material` | enum | optional | wood | таблица | Дерево / металл |
| `roof_material` | enum | optional | metal_tile | таблица | Если есть кровля |
| `glazing_type` | enum | optional | cold | таблица | Если есть остекление |
| `railing_material` | enum | optional | wood | таблица | Ограждение |
| `finish_required` | boolean | optional | true | таблица | Покрытие/обработка |
| `material_comment` | string | optional | клиент выбирает между ДПК и лиственницей | менеджер | Варианты считать отдельно |

Значения `deck_material`:

```text
larch
wpc
pine
impregnated_wood
tile
unknown
other
```

Значения `roof_material`:

```text
metal_tile
profiled_sheet
soft_roof
polycarbonate
standing_seam
transparent_panels
unknown
none
other
```

Значения `glazing_type`:

```text
cold
warm
sliding
pvc
aluminum
soft_windows
unknown
none
other
```

## 13. Условия и коэффициенты

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `urgency` | enum | optional | normal | CRM, таблица | normal / urgent / flexible |
| `season` | enum | optional | spring | таблица | winter / spring / summer / autumn |
| `site_slope` | enum | optional | medium | менеджер | none / low / medium / high |
| `manual_carry_required` | boolean | optional | true | таблица | Нет подъезда |
| `height_work_required` | boolean | optional | false | таблица | Высотные работы |
| `complexity_coefficient` | number | optional | 1.15 | таблица | Лучше считает таблица/менеджер |
| `risk_flags` | array | required | ["unknown_foundation"] | CRM, менеджер | Список рисков |

Возможные `risk_flags`:

```text
unknown_dimensions
unknown_foundation
unknown_materials
project_required
complex_site_access
demolition_required
multiple_variants
warm_extension
glazing_without_sizes
roof_without_slope
client_wants_exact_price
price_not_verified
manager_review_required
```

## 14. Бюджет и сроки

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `budget_range` | string | optional | до 500 000 | CRM | Не давить, спрашивать мягко |
| `desired_start_date` | string/date | optional | май | CRM | Когда хочет начать |
| `deadline` | string/date | optional | до конца июня | CRM | Срочность |
| `decision_stage` | enum | recommended | comparing_options | CRM | just_researching / comparing_options / ready_to_order |

## 15. Поля проекта или файла

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `file_received` | boolean | optional | true | CRM | Файл получен |
| `file_type` | enum | optional | pdf | CRM | pdf / image / spreadsheet / text / other |
| `file_summary` | string | optional | проект веранды | менеджер | Кратко |
| `project_has_specification` | boolean | optional | true | менеджер | Есть ли ведомости/спеки |
| `project_has_foundation` | boolean | optional | true | менеджер | Есть ли фундамент |
| `project_has_roof` | boolean | optional | true | менеджер | Есть ли кровля |
| `project_extraction_status` | enum | optional | pending | менеджер | pending / partial / complete / failed |
| `project_extraction_comment` | string | optional | нужно проверить страницы с фундаментом | менеджер | Что проверить |

## 16. Недостающие данные

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `missing_data` | array | required | ["foundation_type", "city_or_location"] | CRM, менеджер | Список недостающих данных |
| `missing_data_comment` | string | recommended | не выбран фундамент и нет локации | менеджер | Человеческое объяснение |
| `can_estimate_preliminarily` | boolean | required | true | CRM | Можно ли дать предварительный расчет |
| `can_estimate_final` | boolean | required | false | CRM | Почти всегда false до проверки |

Правило:

```text
Если missing_data не пустой, агент обязан сказать, что расчет предварительный или данных недостаточно.
```

## 17. Итог и следующий шаг

| Поле | Тип | Обязательность | Пример | Куда передавать | Комментарий |
|---|---|---|---|---|---|
| `next_step` | enum | required | manager_call | CRM | ask_more / send_project / manager_call / preliminary_estimate / estimate_review |
| `manager_comment` | string | required | клиент готов, нужно позвонить | CRM, менеджер | Главный итог для человека |
| `client_summary` | string | recommended | собрали данные, ждем проект | клиент/CRM | Краткий итог для клиента |
| `lead_status` | enum | recommended | qualified | CRM | new / incomplete / qualified / hot / needs_review / lost |

Значения `next_step`:

```text
ask_more
send_project
send_photo
manager_call
preliminary_estimate
estimate_review
wait_for_client
stop_no_data
```

## 18. Формат JSON для передачи в n8n/API

```json
{
  "client": {
    "name": "",
    "phone": "",
    "messenger": "",
    "contact_preference": "",
    "preferred_contact_time": ""
  },
  "location": {
    "city_or_location": "",
    "address_or_area": "",
    "delivery_distance_km": null,
    "access_complexity": "",
    "access_comment": ""
  },
  "request": {
    "calculation_mode": "",
    "object_type": "",
    "object_type_raw": "",
    "work_type": "",
    "object_description": "",
    "has_project_file": false,
    "project_file_type": ""
  },
  "dimensions": {
    "length_m": null,
    "width_m": null,
    "height_m": null,
    "area_m2": null,
    "roof_area_m2": null,
    "glazing_area_m2": null,
    "perimeter_m": null,
    "dimensions_confidence": ""
  },
  "scope": {
    "foundation_required": null,
    "frame_required": null,
    "deck_required": null,
    "roof_required": null,
    "glazing_required": null,
    "railing_required": null,
    "stairs_required": null,
    "demolition_required": null,
    "waste_removal_required": null,
    "gutter_required": null
  },
  "foundation": {
    "foundation_type": "",
    "foundation_type_raw": "",
    "pile_count": null,
    "foundation_confidence": "",
    "foundation_comment": ""
  },
  "materials": {
    "deck_material": "",
    "frame_material": "",
    "roof_material": "",
    "glazing_type": "",
    "railing_material": "",
    "finish_required": null,
    "material_comment": ""
  },
  "conditions": {
    "urgency": "",
    "season": "",
    "site_slope": "",
    "manual_carry_required": null,
    "height_work_required": null,
    "complexity_coefficient": null,
    "risk_flags": []
  },
  "budget_and_timing": {
    "budget_range": "",
    "desired_start_date": "",
    "deadline": "",
    "decision_stage": ""
  },
  "project": {
    "file_received": false,
    "file_type": "",
    "file_summary": "",
    "project_has_specification": null,
    "project_has_foundation": null,
    "project_has_roof": null,
    "project_extraction_status": "",
    "project_extraction_comment": ""
  },
  "validation": {
    "missing_data": [],
    "missing_data_comment": "",
    "can_estimate_preliminarily": false,
    "can_estimate_final": false,
    "estimate_confidence": ""
  },
  "handoff": {
    "next_step": "",
    "manager_comment": "",
    "client_summary": "",
    "lead_status": ""
  }
}
```

## 19. Формат строки для Google Sheets

Минимальная строка для таблицы заявок:

```text
created_at
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
access_complexity
urgency
missing_data
risk_flags
estimate_confidence
next_step
manager_comment
lead_status
```

## 20. Формат карточки для менеджера

```text
Новая заявка на расчет.

Клиент: {{client_name}}
Телефон: {{phone}}
Локация: {{city_or_location}}

Объект: {{object_type_raw}}
Тип работ: {{work_type}}
Режим расчета: {{calculation_mode}}

Размеры:
- длина: {{length_m}} м
- ширина: {{width_m}} м
- площадь: {{area_m2}} м2
- уверенность по размерам: {{dimensions_confidence}}

Состав:
- фундамент: {{foundation_type}}
- настил: {{deck_material}}
- кровля: {{roof_required}}
- остекление: {{glazing_required}}
- ограждение: {{railing_required}}
- лестница: {{stairs_required}}
- демонтаж: {{demolition_required}}

Условия:
- доступ: {{access_complexity}}
- срочность: {{urgency}}
- комментарий по доступу: {{access_comment}}

Файл/проект:
- есть файл: {{has_project_file}}
- тип файла: {{project_file_type}}

Не хватает:
{{missing_data}}

Риски:
{{risk_flags}}

Комментарий агента:
{{manager_comment}}

Следующий шаг:
{{next_step}}
```

## 21. Правила заполнения полей агентом

### Неизвестное значение

Если данных нет:

```text
unknown
```

или:

```text
null
```

Для текстовых полей можно использовать:

```text
не указано
```

Но лучше не смешивать форматы. Для API использовать `null`, для CRM можно использовать `не указано`.

### Примерные размеры

Если клиент сказал "примерно":

```text
dimensions_confidence = approximate
```

### Фундамент неизвестен

Если клиент не знает фундамент:

```text
foundation_type = unknown
foundation_confidence = low
risk_flags включает unknown_foundation
missing_data включает foundation_type
```

### Клиент просит точную цену

```text
risk_flags включает client_wants_exact_price
can_estimate_final = false
next_step = manager_call или ask_more
```

### Есть проект

```text
calculation_mode = project_pdf
has_project_file = true
project_extraction_status = pending
next_step = send_project или manager_call
```

### Есть несколько вариантов

```text
risk_flags включает multiple_variants
calculation_mode = project_with_changes
manager_comment должен указать, какие варианты считать отдельно
```

## 22. Валидация перед передачей в расчет

Перед отправкой в расчет должны быть заполнены:

```text
object_type
work_type
calculation_mode
length_m или area_m2
foundation_type или risk_flags содержит unknown_foundation
city_or_location
scope работ
```

Если этих данных нет:

```text
can_estimate_preliminarily = false
next_step = ask_more
```

Если данные частично есть:

```text
can_estimate_preliminarily = true
estimate_confidence = low или medium
missing_data должен быть заполнен
```

Если данные полные:

```text
can_estimate_preliminarily = true
estimate_confidence = high
next_step = preliminary_estimate или manager_call
```

`can_estimate_final` почти всегда `false`, пока менеджер не проверил заявку.

## 23. Приоритет вопросов в диалоге

Если данных мало, спрашивать в таком порядке:

1. Тип объекта.
2. Размеры.
3. Состав работ.
4. Фундамент.
5. Материалы.
6. Локация.
7. Фото/проект.
8. Контакт.

Контакт лучше спрашивать после того, как клиент проявил интерес или дал достаточно данных.

## 24. Следующий файл

После карты переменных нужно создать `NEUROAGENTS_SETUP_CHECKLIST.md`.

Он должен описывать пошаговую настройку в интерфейсе:

- создать агента
- вставить промпт
- загрузить базу знаний
- создать переменные
- настроить сценарии
- настроить передачу менеджеру
- подключить таблицу/CRM
- прогнать тест-кейсы
