# DEPLOY_SHARE_LINK.md

## Цель
Получить публичную ссылку на cyberpunk-презентацию:

`codex-cyberpunk-presentation.html`

Локальная ссылка работает только на твоем компьютере. Чтобы ей можно было поделиться, файлы нужно выложить на статический хостинг.

## Вариант 1. Netlify, самый простой
1. Открой https://app.netlify.com/drop
2. Перетащи туда всю папку проекта `E:\CODEX\Нейро-Архитектор`
3. Netlify создаст публичный сайт
4. Презентация будет доступна по адресу:

```text
https://имя-сайта.netlify.app/presentation
```

Или напрямую:

```text
https://имя-сайта.netlify.app/codex-cyberpunk-presentation.html
```

## Вариант 2. GitHub Pages
1. Создай новый репозиторий на GitHub
2. Загрузи в него файлы проекта
3. Открой настройки репозитория
4. Перейди в `Settings -> Pages`
5. В `Build and deployment` выбери:
- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/root`
6. Сохрани настройки

После публикации ссылка будет примерно такой:

```text
https://твой-логин.github.io/имя-репозитория/codex-cyberpunk-presentation.html
```

## Какие файлы нужны для презентации
Минимально нужны:
- `codex-cyberpunk-presentation.html`
- `codex-cyberpunk-presentation.css`
- `codex-cyberpunk-presentation.js`

Если публикуешь только презентацию, загрузи эти три файла в один каталог.

## Рекомендация
Для быстрого теста лучше использовать Netlify Drop. Это самый короткий путь: перетащить папку и сразу получить ссылку.

Для постоянной ссылки лучше использовать GitHub Pages или Netlify с привязанным репозиторием.
