/* ===== ADMIN API ===== */
const ADMIN_API = "https://dysmas-ehitus.onrender.com";

async function loadAdminContent() {
    try {
        const res = await fetch(ADMIN_API + "/api/content");
        if (!res.ok) return;
        const content = await res.json();

        // Merge non-empty admin values into Estonian translations
        for (const [key, value] of Object.entries(content)) {
            if (value && typeof value === "string" && value.trim() && translations.et.hasOwnProperty(key)) {
                translations.et[key] = value;
            }
        }

        // Update contact info directly in DOM (these aren't i18n-driven)
        if (content.phone && content.phone.trim()) {
            document.querySelectorAll('a[href^="tel:"]').forEach(el => {
                el.href = "tel:" + content.phone.replace(/\s/g, "");
                const span = el.querySelector("span");
                if (span) span.textContent = content.phone;
                else if (!el.querySelector("svg")) el.textContent = content.phone;
            });
        }
        if (content.email && content.email.trim()) {
            document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
                el.href = "mailto:" + content.email;
                if (!el.querySelector("svg")) el.textContent = content.email;
            });
        }

        // Re-apply current language to update DOM
        setLanguage(currentLang);
    } catch (e) {
        // Admin API not available — use defaults
    }
}

async function loadAdminGallery() {
    try {
        const res = await fetch(ADMIN_API + "/api/gallery");
        if (!res.ok) return;
        const images = await res.json();
        if (!images.length) return;

        // Insert admin photos into both gallery tracks
        const tracks = [
            document.getElementById("galleryTrack"),
            document.getElementById("galleryTrack2")
        ];

        tracks.forEach(track => {
            if (!track) return;

            // Collect original items (first half — before duplicates)
            const allItems = Array.from(track.querySelectorAll(".gallery__item"));
            const half = Math.floor(allItems.length / 2);
            const originals = allItems.slice(0, half);

            // Build new admin items
            const adminItems = images.map(img => {
                const div = document.createElement("div");
                div.className = "gallery__item";
                const imgEl = document.createElement("img");
                imgEl.src = ADMIN_API + img.url;
                imgEl.alt = img.name || "photo";
                imgEl.loading = "lazy";
                div.appendChild(imgEl);
                return div;
            });

            // Clear track and rebuild: originals + admin + duplicates of all
            track.innerHTML = "";
            const combined = [];
            originals.forEach(el => { track.appendChild(el); combined.push(el); });
            adminItems.forEach(el => { track.appendChild(el); combined.push(el); });
            // Duplicate everything for infinite scroll
            combined.forEach(el => track.appendChild(el.cloneNode(true)));

            // Restart animation so timing matches new width
            track.style.animation = "none";
            track.offsetHeight; // force reflow
            track.style.animation = "";
        });

        // Re-attach click listeners for gallery modal on all images
        const modal = document.getElementById("galleryModal");
        const modalImg = document.getElementById("modalImg");
        if (modal && modalImg) {
            document.querySelectorAll(".gallery__track .gallery__item img").forEach(img => {
                if (!img._modalBound) {
                    img._modalBound = true;
                    img.addEventListener("click", () => {
                        modalImg.src = img.src;
                        modal.classList.add("active");
                        document.body.style.overflow = "hidden";
                        document.querySelectorAll(".gallery__track").forEach(t => t.style.animationPlayState = "paused");
                    });
                }
            });
        }
    } catch (e) {
        // Admin gallery not available — keep default images
    }
}

/* ===== TRANSLATIONS ===== */
const translations = {
    et: {
        nav_home: "Avaleht",
        nav_about: "Meist",
        nav_process: "Kuidas me töötame",
        nav_services: "Teenused",
        nav_projects: "Projektid",
        nav_reviews: "Arvustused",
        nav_contact: "Kontakt",
        hero_badge: "Üle 10 aasta kogemust",
        hero_title: "Ehitame kvaliteeti.<br>Loome kodu.",
        hero_text: "Üldehitustööd vundamendist võtmeteni — pakume usaldusväärset teenust üle kogu Eesti.",
        hero_cta: "Võta ühendust",
        hero_projects: "Vaata projekte",
        stats_experience: "Aastat kogemust",
        stats_projects: "Lõpetatud projekti",
        stats_clients: "Rahulolev klient",
        stats_quality: "Kvaliteet garanteeritud",
        about_tag: "Meist",
        about_title: "Usaldusväärne partner ehituses",
        about_lead: "Üldehitustööd vundamendist võtmeteni – pakume teenust üle Eesti.",
        about_text: "Disma Ehitus on usaldusväärne ehitusettevõte, mis pakub laia valikut ehitus- ja remonttöid üle kogu Eesti. Meie meeskond koosneb kogenud spetsialistidest, kes tagavad iga projekti kõrge kvaliteedi ja tähtaegadest kinnipidamise.",
        about_exp_badge: "aastat<br>kogemust",
        about_f1_title: "Kogenud meeskond",
        about_f1_text: "Professionaalsed ehitusspetsialistid",
        about_f2_title: "Kvaliteedi garantii",
        about_f2_text: "Kasutame ainult kvaliteetseid materjale",
        about_f3_title: "Tähtaegadest kinnipidamine",
        about_f3_text: "Alati õigeaegselt valmis",
        process_tag: "Kuidas me töötame",
        process_title: "Meie tööprotsess",
        process_subtitle: "Lihtne ja läbipaistev koostöö algusest lõpuni.",
        process_s1_title: "Tutvumine",
        process_s1_text: "Kohtume teiega, kuulame soove ja hindame projekti mahtu. Arutame eelarvet, tähtaegu ja ootusi.",
        process_s2_title: "Hindamine",
        process_s2_text: "Teostame objekti ülevaatuse, koostame detailse hinnapakkumise ja tööplaani.",
        process_s3_title: "Kohandamine",
        process_s3_text: "Kohandame lahenduse vastavalt teie soovile — materjalid, disain, ajakava. Kõik vastavalt teie vajadustele.",
        process_s4_title: "Teostus",
        process_s4_text: "Alustame tööd kokkulepitud ajakava järgi. Hoiame teid protsessiga kursis ja tagame kvaliteedi igal etapil.",
        services_tag: "Teenused",
        services_title: "Meie teenused",
        services_subtitle: "Pakume laia valikut ehitus- ja remonttöid, et teie projekt oleks parimas kätes.",
        svc_cat1_title: "Üldehitus",
        svc_cat1_desc: "Täielik ehitusteenus alates vundamendist kuni võtmete üleandmiseni.",
        svc_cat2_title: "Siseviimistlus",
        svc_cat2_desc: "Professionaalne siseviimistlus, mis muudab ruumid kauniks ja funktsionaalseks.",
        svc_cat3_title: "Santehnika",
        svc_cat3_desc: "Sanitaartehnilised tööd ja torustike paigaldus professionaalsel tasemel.",
        svc_1_1: "Ehitustööd ja viimistlustööd",
        svc_1_2: "Üldehitus ja ehitusremonttööd",
        svc_1_3: "Renoveerimine",
        svc_1_4: "Korterite remont",
        svc_1_5: "Vundamenditööd",
        svc_1_6: "Müüritööd ja betoonitööd",
        svc_1_7: "Fassaaditööd",
        svc_1_8: "Katusetööd",
        svc_1_9: "Puitkonstruktsioonid",
        svc_2_1: "Siseviimistlus",
        svc_2_2: "Maalritööd",
        svc_2_3: "Plaatimistööd",
        svc_2_4: "Vannitubade remont",
        svc_2_5: "Akende ja uste paigaldus",
        svc_2_6: "Põrandatööd",
        svc_2_7: "Sauna ehitus",
        svc_2_8: "Terrassid",
        svc_3_1: "Torutööd",
        svc_3_2: "Sanitaartehnika paigaldus",
        svc_3_3: "Torustiku paigaldus ja remont",
        projects_tag: "Projektid",
        projects_title: "Meie tööd",
        projects_subtitle: "Vaadake meie viimaseid projekte ja veenduge meie kvaliteedis.",
        proj_1_title: "Korteri täisremont Tallinnas",
        proj_1_desc: "Täielik korteri renoveerimine, sealhulgas köök, vannituba ja elutuba.",
        proj_2_title: "Vannitoa renoveerimine Tartus",
        proj_2_desc: "Kaasaegne vannitoa lahendus koos kvaliteetsete materjalidega.",
        proj_3_title: "Eramaja ehitus Pärnus",
        proj_3_desc: "Eramaja ehitus vundamendist katuseharjani, võtmed kätte.",
        proj_4_title: "Kontori renoveerimine",
        proj_4_desc: "Kaasaegse kontoriruumi loomine vastavalt kliendi soovidele.",
        gallery_tag: "Galerii",
        gallery_title: "Meie tööd",
        reviews_tag: "Arvustused",
        reviews_title: "Mida meie kliendid ütlevad",
        reviews_count: "Põhineb 25+ arvustusel",
        review_1_text: "\"Suurepärane töö! Korteri remont tehti tähtaegselt ja väga kvaliteetselt. Soovitan kõigile!\"",
        review_2_text: "\"Professionaalne meeskond, kes teab, mida teeb. Vannitoa remont ületas kõik ootused.\"",
        review_3_text: "\"Tegid meie unistuste kodu tegelikkuseks. Kogu protsess oli läbipaistev ja professionaalne.\"",
        reviews_more: "Näita rohkem arvustusi",
        reviews_less: "Näita vähem",
        reviews_source: "Hinnangud portaalist Hange.ee",
        reviews_leave: "Jäta arvustus",
        review_modal_title: "Jätke oma arvustus",
        review_form_name: "Teie nimi",
        review_form_name_ph: "Nt. Jaan T.",
        review_form_service: "Teenus",
        review_form_service_ph: "Nt. Vannitoa remont",
        review_form_rating: "Hinne",
        review_form_text: "Arvustus",
        review_form_text_ph: "Kirjeldage oma kogemust...",
        review_form_submit: "Saada arvustus",
        review_form_success: "Täname! Teie arvustus on saadetud.",
        contact_tag: "Kontakt",
        contact_title: "Võtke meiega ühendust",
        contact_subtitle: "Küsige pakkumist või esitage küsimus — vastame esimesel võimalusel.",
        contact_phone_label: "Telefon",
        form_name_label: "Teie nimi",
        form_name_placeholder: "Sisestage oma nimi",
        form_email_placeholder: "Sisestage oma email",
        form_message_label: "Sõnum",
        form_message_placeholder: "Kirjeldage oma projekti...",
        form_submit: "Saada sõnum",
        contact_address_label: "Aadress",
        contact_address: "Tallinn",
        footer_desc: "Üldehitustööd vundamendist võtmeteni — pakume usaldusväärset teenust üle kogu Eesti.",
        footer_nav: "Navigatsioon",
        footer_rights: "Kõik õigused kaitstud."
    },
    ru: {
        nav_home: "Главная",
        nav_about: "О нас",
        nav_process: "Как мы работаем",
        nav_services: "Услуги",
        nav_projects: "Проекты",
        nav_reviews: "Отзывы",
        nav_contact: "Контакты",
        hero_badge: "Более 10 лет опыта",
        hero_title: "Строим качество.<br>Создаём дом.",
        hero_text: "Строительные работы от фундамента до «под ключ» — надёжный сервис по всей Эстонии.",
        hero_cta: "Связаться с нами",
        hero_projects: "Наши проекты",
        stats_experience: "Лет опыта",
        stats_projects: "Завершённых проектов",
        stats_clients: "Довольных клиентов",
        stats_quality: "Гарантия качества",
        about_tag: "О нас",
        about_title: "Надёжный партнёр в строительстве",
        about_lead: "Объединённые строительные работы от фундамента до «под ключ» — услуги по всей Эстонии.",
        about_text: "Disma Ehitus — надёжная строительная компания, предлагающая широкий спектр строительных и ремонтных работ по всей Эстонии. Наша команда состоит из опытных специалистов, которые гарантируют высокое качество каждого проекта и соблюдение сроков.",
        about_exp_badge: "лет<br>опыта",
        about_f1_title: "Опытная команда",
        about_f1_text: "Профессиональные строительные специалисты",
        about_f2_title: "Гарантия качества",
        about_f2_text: "Используем только качественные материалы",
        about_f3_title: "Соблюдение сроков",
        about_f3_text: "Всегда готово вовремя",
        process_tag: "Как мы работаем",
        process_title: "Наш рабочий процесс",
        process_subtitle: "Простое и прозрачное сотрудничество от начала до конца.",
        process_s1_title: "Знакомство",
        process_s1_text: "Встречаемся с вами, выслушиваем пожелания и оцениваем объём проекта. Обсуждаем бюджет, сроки и ожидания.",
        process_s2_title: "Оценка",
        process_s2_text: "Проводим осмотр объекта, составляем детальное ценовое предложение и план работ.",
        process_s3_title: "Адаптация",
        process_s3_text: "Адаптируем решение под ваши пожелания — материалы, дизайн, график. Всё в соответствии с вашими потребностями.",
        process_s4_title: "Выполнение",
        process_s4_text: "Начинаем работу по согласованному графику. Держим вас в курсе процесса и гарантируем качество на каждом этапе.",
        services_tag: "Услуги",
        services_title: "Наши услуги",
        services_subtitle: "Мы предлагаем широкий спектр строительных и ремонтных работ, чтобы ваш проект был в лучших руках.",
        svc_cat1_title: "Генеральное строительство",
        svc_cat1_desc: "Полный спектр строительных услуг от фундамента до сдачи ключей.",
        svc_cat2_title: "Внутренняя отделка",
        svc_cat2_desc: "Профессиональная внутренняя отделка, которая сделает помещения красивыми и функциональными.",
        svc_cat3_title: "Сантехника",
        svc_cat3_desc: "Сантехнические работы и монтаж трубопроводов на профессиональном уровне.",
        svc_1_1: "Строительные и отделочные работы",
        svc_1_2: "Генеральное строительство и ремонт",
        svc_1_3: "Реновация",
        svc_1_4: "Ремонт квартир",
        svc_1_5: "Фундаментные работы",
        svc_1_6: "Кладочные и бетонные работы",
        svc_1_7: "Фасады и утепление",
        svc_1_8: "Кровельные работы",
        svc_1_9: "Деревянные конструкции",
        svc_2_1: "Внутренняя отделка",
        svc_2_2: "Малярные работы",
        svc_2_3: "Плиточные работы",
        svc_2_4: "Ремонт ванных комнат",
        svc_2_5: "Установка окон и дверей",
        svc_2_6: "Напольные работы",
        svc_2_7: "Строительство саун",
        svc_2_8: "Террасы",
        svc_3_1: "Сантехнические работы",
        svc_3_2: "Монтаж сантехники",
        svc_3_3: "Монтаж и ремонт трубопроводов",
        projects_tag: "Проекты",
        projects_title: "Наши работы",
        projects_subtitle: "Посмотрите наши последние проекты и убедитесь в нашем качестве.",
        proj_1_title: "Полный ремонт квартиры в Таллинне",
        proj_1_desc: "Полная реновация квартиры, включая кухню, ванную комнату и гостиную.",
        proj_2_title: "Ремонт ванной комнаты в Тарту",
        proj_2_desc: "Современное решение для ванной комнаты с качественными материалами.",
        proj_3_title: "Строительство частного дома в Пярну",
        proj_3_desc: "Строительство частного дома от фундамента до конька крыши, под ключ.",
        proj_4_title: "Ремонт офиса",
        proj_4_desc: "Создание современного офисного пространства в соответствии с пожеланиями клиента.",
        gallery_tag: "Галерея",
        gallery_title: "Наши работы",
        reviews_tag: "Отзывы",
        reviews_title: "Что говорят наши клиенты",
        reviews_count: "На основании 25+ отзывов",
        review_1_text: "\"Отличная работа! Ремонт квартиры выполнен в срок и очень качественно. Рекомендую всем!\"",
        review_2_text: "\"Профессиональная команда, которая знает своё дело. Ремонт ванной превзошёл все ожидания.\"",
        review_3_text: "\"Воплотили наш дом мечты в реальность. Весь процесс был прозрачным и профессиональным.\"",
        reviews_more: "Показать больше отзывов",
        reviews_less: "Показать меньше",
        reviews_source: "Оценки с портала Hange.ee",
        reviews_leave: "Оставить отзыв",
        review_modal_title: "Оставьте свой отзыв",
        review_form_name: "Ваше имя",
        review_form_name_ph: "Напр. Иван П.",
        review_form_service: "Услуга",
        review_form_service_ph: "Напр. Ремонт ванной",
        review_form_rating: "Оценка",
        review_form_text: "Отзыв",
        review_form_text_ph: "Опишите ваш опыт...",
        review_form_submit: "Отправить отзыв",
        review_form_success: "Спасибо! Ваш отзыв отправлен.",
        contact_tag: "Контакты",
        contact_title: "Свяжитесь с нами",
        contact_subtitle: "Запросите предложение или задайте вопрос — ответим при первой возможности.",
        contact_phone_label: "Телефон",
        form_name_label: "Ваше имя",
        form_name_placeholder: "Введите ваше имя",
        form_email_placeholder: "Введите ваш email",
        form_message_label: "Сообщение",
        form_message_placeholder: "Опишите ваш проект...",
        form_submit: "Отправить сообщение",
        contact_address_label: "Адрес",
        contact_address: "Таллинн",
        footer_desc: "Строительные работы от фундамента до «под ключ» — надёжный сервис по всей Эстонии.",
        footer_nav: "Навигация",
        footer_rights: "Все права защищены."
    },
    en: {
        nav_home: "Home",
        nav_about: "About",
        nav_process: "How we work",
        nav_services: "Services",
        nav_projects: "Projects",
        nav_reviews: "Reviews",
        nav_contact: "Contact",
        hero_badge: "Over 10 years of experience",
        hero_title: "Building quality.<br>Creating homes.",
        hero_text: "General construction from foundation to turnkey — reliable service across all of Estonia.",
        hero_cta: "Get in touch",
        hero_projects: "View projects",
        stats_experience: "Years of experience",
        stats_projects: "Completed projects",
        stats_clients: "Satisfied clients",
        stats_quality: "Quality guaranteed",
        about_tag: "About us",
        about_title: "A reliable partner in construction",
        about_lead: "General construction from foundation to turnkey — services across all of Estonia.",
        about_text: "Disma Ehitus is a reliable construction company offering a wide range of construction and renovation services across Estonia. Our team consists of experienced specialists who ensure high quality and adherence to deadlines for every project.",
        about_exp_badge: "years of<br>experience",
        about_f1_title: "Experienced team",
        about_f1_text: "Professional construction specialists",
        about_f2_title: "Quality guarantee",
        about_f2_text: "We use only high-quality materials",
        about_f3_title: "Meeting deadlines",
        about_f3_text: "Always completed on time",
        process_tag: "How we work",
        process_title: "Our work process",
        process_subtitle: "Simple and transparent collaboration from start to finish.",
        process_s1_title: "Meeting",
        process_s1_text: "We meet with you, listen to your wishes, and assess the scope of the project. We discuss budget, deadlines, and expectations.",
        process_s2_title: "Assessment",
        process_s2_text: "We conduct an on-site inspection, prepare a detailed price quote, and work plan.",
        process_s3_title: "Customization",
        process_s3_text: "We tailor the solution to your preferences — materials, design, schedule. Everything according to your needs.",
        process_s4_title: "Execution",
        process_s4_text: "We begin work according to the agreed schedule. We keep you informed throughout and ensure quality at every stage.",
        services_tag: "Services",
        services_title: "Our services",
        services_subtitle: "We offer a wide range of construction and renovation services to ensure your project is in the best hands.",
        svc_cat1_title: "General Construction",
        svc_cat1_desc: "Full construction services from foundation to key handover.",
        svc_cat2_title: "Interior Finishing",
        svc_cat2_desc: "Professional interior finishing that makes spaces beautiful and functional.",
        svc_cat3_title: "Plumbing",
        svc_cat3_desc: "Plumbing works and pipeline installation at a professional level.",
        svc_1_1: "Construction and finishing works",
        svc_1_2: "General construction and renovation",
        svc_1_3: "Renovation",
        svc_1_4: "Apartment renovation",
        svc_1_5: "Foundation works",
        svc_1_6: "Masonry and concrete works",
        svc_1_7: "Facade works",
        svc_1_8: "Roofing works",
        svc_1_9: "Wooden structures",
        svc_2_1: "Interior finishing",
        svc_2_2: "Painting works",
        svc_2_3: "Tiling works",
        svc_2_4: "Bathroom renovation",
        svc_2_5: "Window and door installation",
        svc_2_6: "Flooring works",
        svc_2_7: "Sauna construction",
        svc_2_8: "Terraces",
        svc_3_1: "Plumbing works",
        svc_3_2: "Sanitary equipment installation",
        svc_3_3: "Pipeline installation and repair",
        projects_tag: "Projects",
        projects_title: "Our work",
        projects_subtitle: "View our latest projects and see our quality for yourself.",
        proj_1_title: "Full apartment renovation in Tallinn",
        proj_1_desc: "Complete apartment renovation including kitchen, bathroom, and living room.",
        proj_2_title: "Bathroom renovation in Tartu",
        proj_2_desc: "Modern bathroom solution with high-quality materials.",
        proj_3_title: "Private house construction in Pärnu",
        proj_3_desc: "Private house construction from foundation to roof ridge, turnkey.",
        proj_4_title: "Office renovation",
        proj_4_desc: "Creating a modern office space according to client wishes.",
        gallery_tag: "Gallery",
        gallery_title: "Our work",
        reviews_tag: "Reviews",
        reviews_title: "What our clients say",
        reviews_count: "Based on 25+ reviews",
        review_1_text: "\"Excellent work! The apartment renovation was completed on time and with great quality. Highly recommended!\"",
        review_2_text: "\"A professional team that knows what they're doing. The bathroom renovation exceeded all expectations.\"",
        review_3_text: "\"They made our dream home a reality. The entire process was transparent and professional.\"",
        reviews_more: "Show more reviews",
        reviews_less: "Show less",
        reviews_source: "Ratings from Hange.ee portal",
        reviews_leave: "Leave a review",
        review_modal_title: "Leave your review",
        review_form_name: "Your name",
        review_form_name_ph: "E.g. John D.",
        review_form_service: "Service",
        review_form_service_ph: "E.g. Bathroom renovation",
        review_form_rating: "Rating",
        review_form_text: "Review",
        review_form_text_ph: "Describe your experience...",
        review_form_submit: "Submit review",
        review_form_success: "Thank you! Your review has been submitted.",
        contact_tag: "Contact",
        contact_title: "Get in touch",
        contact_subtitle: "Request a quote or ask a question — we'll respond at the earliest opportunity.",
        contact_phone_label: "Phone",
        form_name_label: "Your name",
        form_name_placeholder: "Enter your name",
        form_email_placeholder: "Enter your email",
        form_message_label: "Message",
        form_message_placeholder: "Describe your project...",
        form_submit: "Send message",
        contact_address_label: "Address",
        contact_address: "Tallinn",
        footer_desc: "General construction from foundation to turnkey — reliable service across all of Estonia.",
        footer_nav: "Navigation",
        footer_rights: "All rights reserved."
    }
};

/* ===== STATE ===== */
let currentLang = "et";

/* ===== DOM READY ===== */
document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initMobileNav();
    initLangSwitcher();
    initRevealAnimations();
    initStatsCounter();
    initGalleryModal();
    initContactForm();
    initSmoothScroll();
    initActiveNav();
    initReviews();
    initReviewModal();
    loadAdminContent();
    loadAdminGallery();
});

/* ===== HEADER SCROLL ===== */
function initHeader() {
    const header = document.getElementById("header");
    let lastScroll = 0;

    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        lastScroll = currentScroll;
    }, { passive: true });
}

/* ===== MOBILE NAV ===== */
function initMobileNav() {
    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");

    burger.addEventListener("click", () => {
        burger.classList.toggle("active");
        nav.classList.toggle("open");
        document.body.style.overflow = nav.classList.contains("open") ? "hidden" : "";
    });

    nav.querySelectorAll(".nav__link").forEach(link => {
        link.addEventListener("click", () => {
            burger.classList.remove("active");
            nav.classList.remove("open");
            document.body.style.overflow = "";
        });
    });
}

/* ===== LANGUAGE SWITCHER ===== */
function initLangSwitcher() {
    const btn = document.getElementById("langBtn");
    const dropdown = document.getElementById("langDropdown");
    const switcher = btn.closest(".lang-switcher");
    const options = dropdown.querySelectorAll(".lang-switcher__option");

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        switcher.classList.toggle("open");
    });

    document.addEventListener("click", () => {
        switcher.classList.remove("open");
    });

    options.forEach(option => {
        option.addEventListener("click", () => {
            const lang = option.dataset.lang;
            setLanguage(lang);
            switcher.classList.remove("open");

            options.forEach(o => o.classList.remove("active"));
            option.classList.add("active");

            btn.querySelector(".lang-switcher__current").textContent = lang.toUpperCase();
        });
    });
}

function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    if (!t) return;

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (t[key]) {
            el.placeholder = t[key];
        }
    });

    renderReviews();
}

/* ===== REVEAL ANIMATIONS ===== */
function initRevealAnimations() {
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(el => observer.observe(el));
}

/* ===== STATS COUNTER ===== */
function initStatsCounter() {
    const numbers = document.querySelectorAll(".stats__number[data-count]");
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                animateCounters(numbers);
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector(".stats");
    if (statsSection) observer.observe(statsSection);
}

function animateCounters(numbers) {
    numbers.forEach(num => {
        const target = parseInt(num.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            num.textContent = Math.floor(current);
        }, 16);
    });
}

/* ===== GALLERY MODAL ===== */
function initGalleryModal() {
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("modalImg");
    const modalClose = document.getElementById("modalClose");
    const tracks = document.querySelectorAll(".gallery__track");

    if (!tracks.length || !modal) return;

    tracks.forEach(track => {
        track.querySelectorAll(".gallery__item img").forEach(img => {
            img.addEventListener("click", () => {
                modalImg.src = img.src;
                modal.classList.add("active");
                document.body.style.overflow = "hidden";
                tracks.forEach(t => t.style.animationPlayState = "paused");
            });
        });
    });

    function closeModal() {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        tracks.forEach(t => t.style.animationPlayState = "");
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
}

/* ===== CONTACT FORM ===== */
function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    // Валидация email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Валидация текста (без инъекций)
    function sanitizeInput(str) {
        return str.trim().slice(0, 5000);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = sanitizeInput(form.querySelector("#name").value);
        const email = sanitizeInput(form.querySelector("#email").value);
        const message = sanitizeInput(form.querySelector("#message").value);

        // Проверки
        if (!name || name.length < 2) {
            alert(currentLang === "ru" ? "Имя должно быть минимум 2 символа" : "Name must be at least 2 characters");
            return;
        }

        if (!isValidEmail(email)) {
            alert(currentLang === "ru" ? "Введите корректный email" : "Please enter a valid email");
            return;
        }

        if (!message) {
            alert(currentLang === "ru" ? "Введите сообщение" : currentLang === "en" ? "Please enter a message" : "Palun sisestage sõnum");
            return;
        }

        if (message.length > 1000) {
            alert(currentLang === "ru" ? "Сообщение не должно превышать 1000 символов" : currentLang === "en" ? "Message must not exceed 1000 characters" : "Sõnum ei tohi ületada 1000 tähemärki");
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = currentLang === "ru" ? "Отправка..." : currentLang === "en" ? "Sending..." : "Saatmine...";

        try {
            const response = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message })
            });

            const data = await response.json();

            if (response.ok) {
                btn.textContent = currentLang === "ru" ? "Отправлено ✓" : currentLang === "en" ? "Sent ✓" : "Saadetud ✓";
                btn.style.background = "var(--color-success)";
                btn.style.borderColor = "var(--color-success)";
                setTimeout(() => {
                    form.reset();
                    btn.textContent = originalText;
                    btn.style.background = "";
                    btn.style.borderColor = "";
                    btn.disabled = false;
                }, 3000);
            } else {
                throw new Error(data.error || "Failed");
            }
        } catch (err) {
            btn.textContent = currentLang === "ru" ? "Ошибка ✗" : currentLang === "en" ? "Error ✗" : "Viga ✗";
            btn.style.background = "#e74c3c";
            btn.style.borderColor = "#e74c3c";
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = "";
                btn.style.borderColor = "";
                btn.disabled = false;
            }, 3000);
        }
    });
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

/* ===== ACTIVE NAV ===== */
function initActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav__link");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: "-80px 0px -50% 0px"
    });

    sections.forEach(section => observer.observe(section));
}

/* ===== REVIEWS DATA & RENDERING ===== */
const reviewsData = [
    { service: { et: "Püstaku vahetus", ru: "Замена стояка", en: "Riser replacement" }, rating: 5.0, date: "28.03.2026",
      text: { et: "Töö oli kiire ja korralik. Väga viisakad ja asjalikud mehed.", ru: "Работа была быстрой и аккуратной. Очень вежливые и деловые ребята.", en: "The work was fast and neat. Very polite and professional guys." }, author: "Priit V." },
    { service: { et: "Kanalisatsiooni remont", ru: "Ремонт канализации", en: "Sewer repair" }, rating: 4.7, date: "20.03.2026",
      text: { et: "Väga tublid. Töö kiire ja korralik. Probleemid lahendatud.", ru: "Очень молодцы. Работа быстрая и аккуратная. Проблемы решены.", en: "Very diligent. Work was fast and neat. Problems solved." }, author: "Tiit K." },
    { service: { et: "Kortermaja külmaveetorustiku renoveerimine", ru: "Реновация холодного водоснабжения многоквартирного дома", en: "Cold water piping renovation in apartment building" }, rating: 5.0, date: "03.03.2026",
      text: { et: "Korralik, kiire ja paindlik, leiab lahenduse ka keerulisemate olukordade korral.", ru: "Аккуратный, быстрый и гибкий, находит решение даже в сложных ситуациях.", en: "Neat, fast and flexible, finds solutions even in complicated situations." }, author: "Marek L." },
    { service: { et: "Korteri siselammutustööd", ru: "Демонтажные работы в квартире", en: "Apartment demolition works" }, rating: 5.0, date: "03.03.2026",
      text: { et: "Suhtlus oli operatiivne ja konkreetne. Töö teostati korrektselt ja kiirelt. Hinnakokkuleppest peeti kinni.", ru: "Общение было оперативным и конкретным. Работа выполнена корректно и быстро. Договорённость по цене соблюдена.", en: "Communication was prompt and clear. Work was done correctly and quickly. Price agreement was honored." }, author: "Merike L." },
    { service: { et: "Vanni asendamine dušiseinaga", ru: "Замена ванны на душевую перегородку", en: "Replacing bathtub with shower screen" }, rating: 5.0, date: "23.02.2026",
      text: { et: "Väga kiire ning kvaliteetne töö mõistliku hinna eest. Sõbralik ja abivalmis suhtumine, ehitaja mõtleb ise kaasa ning pakub lahendusi. Selgelt suure kogemuste pagasiga ning teostus väga kvaliteetne. Soovitan!", ru: "Очень быстрая и качественная работа за разумную цену. Дружелюбное и отзывчивое отношение, строитель сам думает и предлагает решения. Явно с большим опытом, исполнение очень качественное. Рекомендую!", en: "Very fast and high-quality work for a reasonable price. Friendly and helpful attitude, the builder thinks along and offers solutions. Clearly very experienced, execution was top quality. Highly recommend!" }, author: "Sander T." },
    { service: { et: "Veearvesti konsooli paigaldamine", ru: "Установка консоли водомера", en: "Water meter console installation" }, rating: 5.0, date: "20.02.2026",
      text: { et: "Usaldusväärne, asjatundlik ja korrektne inimene, kes teab, mida ja kuidas teha. Tõeline leid!", ru: "Надёжный, компетентный и корректный человек, который знает, что и как делать. Настоящая находка!", en: "Reliable, knowledgeable and correct person who knows what and how to do. A real find!" }, author: "Riina T." },
    { service: { et: "Pelletikatla ühendamine olemasoleva küttesüsteemiga", ru: "Подключение пеллетного котла к существующей системе отопления", en: "Connecting pellet boiler to existing heating system" }, rating: 5.0, date: "10.02.2026",
      text: { et: "Töö pelletikatla ühendamisel olemasoleva küttesüsteemiga oli väga professionaalne ja läbimõeldud. Süsteem töötab tõrgeteta ja efektiivselt. Väga meeldiv kogemus – usaldusväärne spetsialist, keda julgen kindlasti soovitada!", ru: "Работа по подключению пеллетного котла к существующей системе отопления была очень профессиональной и продуманной. Система работает без сбоев и эффективно. Очень приятный опыт – надёжный специалист, которого смело рекомендую!", en: "The work connecting the pellet boiler to the existing heating system was very professional and well thought out. The system works flawlessly and efficiently. A very pleasant experience – a reliable specialist I can definitely recommend!" }, author: "Kaitis K." },
    { service: { et: "Nurgavanni paigaldus", ru: "Установка угловой ванны", en: "Corner bathtub installation" }, rating: 5.0, date: "04.02.2026", text: null, author: null },
    { service: { et: "Vanni asendamine dušši asemele", ru: "Замена ванны на душ", en: "Replacing bathtub with shower" }, rating: 4.7, date: "29.01.2026", text: null, author: null },
    { service: { et: "Põranda tasandamine", ru: "Выравнивание пола", en: "Floor leveling" }, rating: 5.0, date: "26.01.2026",
      text: { et: "Tõeline kergendus on teadmine, et töömeest saab usaldada. Minu parandustöö vajadus oli natuke ebastandardne, kuid vaatamata kõigele sai töö tehtud korralikult ja ületas minu ootusi. Samuti on inimene lahke, abivalmis ja sõbralik, mistõttu oli koostöö veelgi muretum ja meeldiv.", ru: "Настоящее облегчение – знать, что мастеру можно доверять. Мой ремонт был нестандартным, но несмотря на это, работа была выполнена аккуратно и превзошла мои ожидания. Человек добрый, отзывчивый и дружелюбный, поэтому сотрудничество было ещё приятнее.", en: "A true relief knowing you can trust the worker. My repair need was a bit non-standard, but despite everything the work was done properly and exceeded my expectations. Also a kind, helpful and friendly person, making the cooperation even more pleasant." }, author: "Sarlee R." },
    { service: { et: "Vannitoa kraanikausi vahetus", ru: "Замена раковины в ванной", en: "Bathroom sink replacement" }, rating: 5.0, date: "16.01.2026",
      text: { et: "Väga asjalik meistrimees, tundis oma tööd väga hästi, töö tehti kiiresti ja kõik tööks vajalikud detailid olid tal olemas, et kohe lõpptulemust saada. Suurepärane!", ru: "Очень деловой мастер, отлично знал своё дело, работа выполнена быстро, все необходимые детали были при нём. Отлично!", en: "Very professional craftsman, knew his work very well, the job was done quickly and he had all necessary parts for an immediate result. Excellent!" }, author: "Hille R." },
    { service: { et: "Torutööd korteris", ru: "Сантехнические работы в квартире", en: "Plumbing works in apartment" }, rating: 5.0, date: "03.01.2026",
      text: { et: "Korralik ja kiire töö, jäime väga rahule!", ru: "Аккуратная и быстрая работа, остались очень довольны!", en: "Neat and fast work, we were very satisfied!" }, author: "Kerli P." },
    { service: { et: "Kraanide vahetus", ru: "Замена кранов", en: "Faucet replacement" }, rating: 5.0, date: "02.01.2026",
      text: { et: "Tõesti meeldiv kogemus! Esialgne minupoolne plaan ei olnud kõige optimaalsem, töö teostaja mõtles välja parema lahenduse, arutasime läbi ja sai valmis. Täpselt see, mida ma ootasin – kaasamõtlemine ja kvaliteetne teostus.", ru: "Действительно приятный опыт! Мой первоначальный план был не самым оптимальным, исполнитель придумал лучшее решение, мы обсудили, и всё было сделано. Именно то, что я ожидал – совместное мышление и качественное исполнение.", en: "A truly pleasant experience! My initial plan wasn't the most optimal, the contractor came up with a better solution, we discussed it and it was done. Exactly what I expected – collaborative thinking and quality execution." }, author: "Markko J." },
    { service: { et: "Vannitoa kapitaalremont", ru: "Капитальный ремонт ванной", en: "Full bathroom renovation" }, rating: 5.0, date: "30.12.2025",
      text: { et: "Jäime teostatud tööga väga rahule. Suhtlus oli algusest lõpuni väga lihtne ja kiire. Erinevaid töid tegid oma ala professionaalid ning lõpptulemus on kvaliteetne. Kokkuvõttes jäime väga rahule ja kutsume nad hea meelega ka tulevikus teisi tube renoveerima.", ru: "Остались очень довольны выполненной работой. Общение от начала до конца было очень простым и быстрым. Разные работы выполняли профессионалы своего дела, конечный результат качественный. В итоге остались очень довольны и с удовольствием пригласим их и для ремонта других комнат.", en: "We were very satisfied with the work. Communication was very simple and fast from start to finish. Different works were done by professionals and the final result is high quality. Overall very satisfied and would happily invite them to renovate other rooms." }, author: "Laura P." },
    { service: { et: "Vannituba", ru: "Ванная комната", en: "Bathroom" }, rating: 5.0, date: "27.12.2025",
      text: { et: "Väga hea koostöö. Tööde käigus tekkinud takistused said kiirelt ja korrektselt lahendatud. Töö käigus saime ka muud ehitusalast nõu. Oleme lõpptulemusega väga rahul.", ru: "Очень хорошее сотрудничество. Возникшие в ходе работ препятствия были быстро и корректно устранены. В процессе работы получили и другие строительные советы. Результатом очень довольны.", en: "Very good cooperation. Obstacles encountered during the work were resolved quickly and correctly. We also received other construction advice during the process. Very satisfied with the result." }, author: "Raul K." },
    { service: { et: "Akna paigaldus", ru: "Установка окна", en: "Window installation" }, rating: 5.0, date: "16.12.2025",
      text: { et: "Väga rahul tulemuse ja kvaliteediga. Eriti tahan tänada tööde väga kiire teostamise eest. Korrektsed ja vastutustundlikud mehed – oleks rohkem selliseid professionaale. Soovitan kõigile!", ru: "Очень доволен результатом и качеством. Особенно благодарю за очень быстрое выполнение работ. Корректные и ответственные ребята – побольше бы таких профессионалов. Рекомендую всем!", en: "Very satisfied with the result and quality. Especially grateful for the very fast execution. Correct and responsible guys – wish there were more such professionals. Recommend to everyone!" }, author: "Arkadi T." },
    { service: { et: "Kanalisatsiooni püstaku ja veetrassi ehitus", ru: "Строительство канализационного стояка и водопровода", en: "Sewer riser and water line construction" }, rating: 4.7, date: "19.11.2025",
      text: { et: "Ühe veetoru nurga oleks võinud veel panna, aga muidu töö kiire ja korralik.", ru: "Один угол водопроводной трубы можно было бы ещё добавить, но в остальном работа быстрая и аккуратная.", en: "Could have added one more water pipe corner, but otherwise the work was fast and neat." }, author: "Kaja R." },
    { service: { et: "Vesi-põrandakütte paigaldamine", ru: "Установка водяного тёплого пола", en: "Underfloor water heating installation" }, rating: 5.0, date: "13.11.2025",
      text: { et: "Vesi-põrandakütte paigaldamisel lisaks tegid ka plaatimistöid ja muud nipet-näpet. Tegid korralikult ja kiirelt oma töö ära.", ru: "При установке водяного тёплого пола также выполнили плиточные работы и прочие мелочи. Сделали свою работу аккуратно и быстро.", en: "During the underfloor heating installation they also did tiling and other small tasks. Did their work neatly and quickly." }, author: "Hannes S." },
    { service: { et: "Torutööd", ru: "Сантехнические работы", en: "Plumbing works" }, rating: 5.0, date: "12.11.2025",
      text: { et: "Töö kiire ja korralik. Kindlasti soovitan.", ru: "Работа быстрая и аккуратная. Однозначно рекомендую.", en: "Work was fast and neat. Definitely recommend." }, author: "Veiko K." },
    { service: { et: "Korteri kanalisatsioonitorude ja veepüstaku ümberpaigutamine", ru: "Перемещение канализационных труб и водяного стояка в квартире", en: "Relocating apartment sewer pipes and water riser" }, rating: 5.0, date: "06.11.2025",
      text: { et: "Oleme väga rahul, töö sai tehtud kiiresti ja korralikult.", ru: "Очень довольны, работа была выполнена быстро и аккуратно.", en: "We are very satisfied, the work was done quickly and neatly." }, author: "Kaarin K." },
    { service: { et: "Eramaja kanalisatsioon ja soojuspumba torude paigaldus", ru: "Канализация частного дома и монтаж труб теплового насоса", en: "Private house sewage and heat pump pipe installation" }, rating: 5.0, date: "04.10.2025",
      text: { et: "Soovitan teistele. Väga viisakad, oskavad ise ka mõelda ning kaasa rääkida. Küsimustele vastavad koheselt. Annavad soovitusi. Teavad nõudeid. Täpsed. Kõik kokkulepped toimisid. Töö korrektne ning tehtud kaasaegselt ning kiirelt.", ru: "Рекомендую другим. Очень вежливые, умеют сами думать и участвовать в обсуждении. На вопросы отвечают сразу. Дают рекомендации. Знают требования. Точные. Все договорённости соблюдены. Работа корректная, сделана современно и быстро.", en: "Recommend to others. Very polite, can think independently and contribute to discussions. Answer questions immediately. Give recommendations. Know requirements. Precise. All agreements were honored. Work was correct, modern and fast." }, author: "Reelika R." },
    { service: { et: "Värskeõhuklapi ehitus ja paigaldus", ru: "Изготовление и установка приточного клапана", en: "Fresh air valve construction and installation" }, rating: 4.7, date: "25.09.2025", text: null, author: null },
    { service: { et: "Sauna ehitus", ru: "Строительство сауны", en: "Sauna construction" }, rating: 5.0, date: "31.08.2025",
      text: { et: "Hea suhtlus, head loovad lahendused ebatavapärastele probleemidele, kiire töö, hoidsid puhtust ja olid autonoomsed.", ru: "Хорошее общение, креативные решения для нестандартных проблем, быстрая работа, поддерживали чистоту и работали самостоятельно.", en: "Good communication, creative solutions for unusual problems, fast work, kept things clean and worked autonomously." }, author: "Taavi A." },
    { service: { et: "Põranda plaatide vahetamine", ru: "Замена напольной плитки", en: "Floor tile replacement" }, rating: 5.0, date: "12.06.2025",
      text: { et: "Kõik käis sujuvalt ja nagu kokkulepitud.", ru: "Всё прошло гладко и как договорились.", en: "Everything went smoothly and as agreed." }, author: "Tanel L." },
    { service: { et: "Ukse vahetamine", ru: "Замена двери", en: "Door replacement" }, rating: 5.0, date: "26.05.2025",
      text: { et: "Sujuv ja paindlik koostöö. Jooksvalt tekkinud probleemid said läbi räägitud ja lahendatud. Hind vastab kvaliteedile.", ru: "Гладкое и гибкое сотрудничество. Возникшие по ходу проблемы были обсуждены и решены. Цена соответствует качеству.", en: "Smooth and flexible cooperation. Problems that arose were discussed and resolved. Price matches quality." }, author: "Alik S." }
];

const REVIEWS_PER_PAGE = 3;
let reviewsShown = 0;

function initReviews() {
    const grid = document.getElementById('reviewsGrid');
    const moreBtn = document.getElementById('reviewsMoreBtn');
    const lessBtn = document.getElementById('reviewsLessBtn');
    if (!grid || !moreBtn) return;

    showMoreReviews();
    moreBtn.addEventListener('click', showMoreReviews);
    if (lessBtn) {
        lessBtn.addEventListener('click', showLessReviews);
    }
}

function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    const moreBtn = document.getElementById('reviewsMoreBtn');
    const lessBtn = document.getElementById('reviewsLessBtn');
    if (!grid) return;

    grid.innerHTML = '';
    const visibleReviews = reviewsData.slice(0, reviewsShown);

    visibleReviews.forEach(review => {
        grid.appendChild(createReviewCard(review));
    });

    if (moreBtn) {
        moreBtn.parentElement.style.display = '';
        moreBtn.style.display = reviewsShown >= reviewsData.length ? 'none' : '';
    }
    if (lessBtn) {
        lessBtn.style.display = reviewsShown > REVIEWS_PER_PAGE ? '' : 'none';
    }
}

function showMoreReviews() {
    reviewsShown = Math.min(reviewsShown + REVIEWS_PER_PAGE, reviewsData.length);
    renderReviews();
}

function showLessReviews() {
    reviewsShown = REVIEWS_PER_PAGE;
    renderReviews();
    const section = document.getElementById('reviews');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'reviews__card reveal visible';

    const lang = currentLang;
    const serviceName = typeof review.service === 'object' ? (review.service[lang] || review.service.et) : review.service;
    const reviewText = review.text ? (typeof review.text === 'object' ? (review.text[lang] || review.text.et) : review.text) : null;

    const stars = '\u2605'.repeat(Math.round(review.rating)) + '\u2606'.repeat(5 - Math.round(review.rating));

    let html = '<span class="reviews__card-service">' + escapeHtml(serviceName) + '</span>';
    html += '<div class="reviews__card-stars">' + stars + ' <span class="reviews__card-score">' + review.rating + '</span></div>';

    if (reviewText) {
        html += '<p class="reviews__card-text">\u201c' + escapeHtml(reviewText) + '\u201d</p>';
    }

    if (review.author) {
        const initials = review.author.replace(/\./g, '').split(/\s+/).map(w => w[0]).join('');
        html += '<div class="reviews__card-author">';
        html += '<div class="reviews__card-avatar">' + escapeHtml(initials) + '</div>';
        html += '<div><strong>' + escapeHtml(review.author) + '</strong><span>' + escapeHtml(review.date) + '</span></div>';
        html += '</div>';
    }

    card.innerHTML = html;
    return card;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ===== REVIEW MODAL ===== */
function initReviewModal() {
    const openBtn = document.getElementById('leaveReviewBtn');
    const modal = document.getElementById('reviewModal');
    const closeBtn = document.getElementById('reviewModalClose');
    const backdrop = document.getElementById('reviewModalBackdrop');
    const form = document.getElementById('reviewForm');
    const starsContainer = document.getElementById('reviewStars');
    if (!openBtn || !modal || !form) return;

    let selectedRating = 0;

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    if (starsContainer) {
        const stars = starsContainer.querySelectorAll('.review-modal__star');
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.value);
                stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= val));
            });
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.value);
                stars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.value) <= selectedRating));
            });
        });
        starsContainer.addEventListener('mouseleave', () => {
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
            });
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (selectedRating === 0) {
            starsContainer.classList.add('shake');
            setTimeout(() => starsContainer.classList.remove('shake'), 500);
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const t = translations[currentLang] || translations.et;
        btn.textContent = t.review_form_success || 'Täname!';
        btn.style.background = 'var(--color-success)';
        btn.style.borderColor = 'var(--color-success)';
        btn.disabled = true;

        setTimeout(() => {
            form.reset();
            selectedRating = 0;
            const stars = starsContainer.querySelectorAll('.review-modal__star');
            stars.forEach(s => { s.classList.remove('selected'); s.classList.remove('active'); });
            btn.textContent = t.review_form_submit || 'Saada arvustus';
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
            closeModal();
        }, 2000);
    });
}
