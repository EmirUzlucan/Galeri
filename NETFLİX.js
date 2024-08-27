document.addEventListener("DOMContentLoaded", function () {
    let db;
    const request = indexedDB.open("MediaDatabase", 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const fotoğraflarStore = db.createObjectStore("fotoğraflar", { keyPath: "id", autoIncrement: true });
        fotoğraflarStore.createIndex("fileNameIndex", "fileName", { unique: false });
        const videolarStore = db.createObjectStore("videolar", { keyPath: "id", autoIncrement: true });
        videolarStore.createIndex("fileNameIndex", "fileName", { unique: false });
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("IndexedDB'ye bağlanıldı");
        initializeApp();
    };

    request.onerror = function (event) {
        console.error("IndexedDB hatası:", event);
    };

    function initializeApp() {
        if (window.location.pathname.includes("index.html")) {
            handleIndexPage();
        } else if (window.location.pathname.includes("selam.html")) {
            handleSelamPage();
        } else if (window.location.pathname.includes("fotograflar.html")) {
            handleFotograflarPage();
        } else if (window.location.pathname.includes("videolar.html")) {
            handleVideolarPage();
        }
    }

    function handleIndexPage() {
        if (window.location.pathname.includes("index.html")) {
            let nav = document.querySelector(".nav");
            let searchBox = document.querySelector(".conteiner .nav .nav_icons .nav_icon");
            let searchButton = searchBox.querySelector(".search_tab");
            let searchInput = searchBox.querySelector("input");
            let searchCloseButton = searchBox.querySelector(".close_tab");
            let searchCloseIcon = searchCloseButton.querySelector("img");
            let main = document.querySelector(".main");
            let mainPlaceholder = main.querySelector(".main_placeholder");
            let mainVideoDiv = mainPlaceholder.querySelector(".main_video");
            let video = mainVideoDiv.querySelector("video");
            let videoImg = mainVideoDiv.querySelector("img");
            let years = main.querySelectorAll(".years");
            let sayac = 0;
            let InputValue = "";
            let gridContainer = main.querySelector(".grid");
            let bulunanİçerikler = [];
            let fotograflar = JSON.parse(localStorage.getItem("fotoğraf")) || [];
            let videolar = JSON.parse(localStorage.getItem("video")) || [];

            function closeInput(element) {
                element.style.display = "none";
                element.parentElement.style.border = "none";
                element.parentElement.style.background = "none";
            }

            searchInput.addEventListener("input", function (event) {
                const inputValue = event.target.value.trim().toUpperCase();

                if (inputValue === "") {
                    gridContainer.innerHTML = "";
                    displayNone(searchCloseIcon);
                    displayBlock(mainPlaceholder);
                } else {
                    displayBlock(searchCloseIcon);
                    displayNone(mainPlaceholder);

                    searchInDatabase(inputValue);
                }
            });

            function searchInDatabase(query) {
                const transaction = db.transaction(["fotoğraflar", "videolar"], "readonly");
                const objectStoreFotoğraflar = transaction.objectStore("fotoğraflar");
                const objectStoreVideolar = transaction.objectStore("videolar");
                const gridContainer = document.querySelector(".grid");

                gridContainer.innerHTML = "";

                const fotoğraflarRequest = objectStoreFotoğraflar.openCursor();
                const videolarRequest = objectStoreVideolar.openCursor();

                fotoğraflarRequest.onsuccess = function (event) {
                    const cursor = event.target.result;

                    if (cursor) {
                        const { yıl, konu, fileName, file } = cursor.value;

                        if (yıl.toUpperCase().includes(query) || konu.toUpperCase().includes(query) || query.toUpperCase().includes(yıl) || query.toUpperCase().includes(konu)) {
                            appendToGrid(file, fileName);
                        }

                        cursor.continue();
                    }
                };

                fotoğraflarRequest.onerror = function () {
                    console.error("Fotoğraflar verisi çekme hatası");
                };

                videolarRequest.onsuccess = function (event) {
                    const cursor = event.target.result;

                    if (cursor) {
                        const { yıl, konu, fileName, file } = cursor.value;

                        if (yıl.toUpperCase().includes(query) || konu.toUpperCase().includes(query) || query.toUpperCase().includes(yıl) || query.toUpperCase().includes(konu)) {
                            appendToGrid(file, fileName);
                        }

                        cursor.continue();
                    }
                };

                videolarRequest.onerror = function () {
                    console.error("Videolar verisi çekme hatası");
                };

                function appendToGrid(file, fileName) {
                    const contentDiv = document.createElement('div');
                    const contentA = document.createElement('a');
                    const contentElement = fileName.endsWith('.mp4') ? document.createElement('video') : document.createElement('img');

                    contentDiv.classList.add("content");
                    contentA.classList.add("content_a");
                    contentA.href = file;
                    contentElement.src = file;

                    contentA.appendChild(contentElement);
                    contentDiv.appendChild(contentA);
                    gridContainer.appendChild(contentDiv);

                    let hoverTimeout;
                    contentElement.addEventListener('mouseenter', function (e) {
                        hoverTimeout = setTimeout(function () {
                            e.target.classList.add(contentElement.tagName.toLowerCase() === "img" ? "img_hover" : "video_hover");
                            if (contentElement.tagName.toLowerCase() === "video") {
                                e.target.play();
                            }
                        }, 500);
                    });
                    contentElement.addEventListener('mouseleave', function (e) {
                        clearTimeout(hoverTimeout);
                        e.target.classList.remove(contentElement.tagName.toLowerCase() === "img" ? "img_hover" : "video_hover");
                        if (contentElement.tagName.toLowerCase() === "video") {
                            e.target.pause();
                            e.target.currentTime = 0;
                        }
                    });
                }
            }

            function displayBlock(element) {
                element.classList.remove("display_none");
                element.classList.add("display_block");
            }

            function displayNone(element) {
                element.classList.remove("display_block");
                element.classList.add("display_none");
            }

            searchButton.addEventListener("click", function () {
                if (sayac === 0) {
                    sayac++;
                    searchInput.parentElement.style.border = "1px solid hsla(0, 0%, 100%, .85)";
                    searchInput.parentElement.style.background = "rgba(0,0,0,.75)";
                    searchInput.style.display = "block";
                    displayBlock(searchCloseButton);
                    searchInput.focus();
                } else {
                    if (InputValue === "") {
                        closeInput(searchInput);
                        displayNone(searchCloseButton);
                        sayac--;
                    }
                }
            });

            document.addEventListener("click", function (event) {
                if (sayac === 1 && !searchBox.contains(event.target)) {
                    if (InputValue === "") {
                        closeInput(searchInput);
                        displayNone(searchCloseButton);
                        sayac--;
                    }
                }
            });

            searchCloseButton.addEventListener("click", function () {
                displayNone(searchCloseIcon);
                displayBlock(mainPlaceholder);
                gridContainer.innerHTML = "";
                searchInput.focus();
                searchInput.value = "";
                InputValue = "";
            });

            window.addEventListener("scroll", function () {
                if (window.scrollY === 0) {
                    nav.classList.add("transparent");
                } else {
                    nav.classList.remove("transparent");
                }
            });

            video.addEventListener("ended", function () {
                displayNone(video);
                displayBlock(videoImg);
            });

            years.forEach(function (year) {
                let row = year.querySelector(".row");
                let slider = row.querySelector("div");
                let sayacSliderDiv = slider.querySelectorAll("div").length;
                let rowScrollLeftButton = year.querySelectorAll("button")[0];
                let rowScrollRightButton = year.querySelectorAll("button")[1];
                let sliderWidth;
                let translateX = 0;
                let sayac = 0;

                function updateSliderWidth() {
                    sliderWidth = slider.offsetWidth;
                }

                function updateSliderPosition() {
                    translateX = sliderWidth * sayac;
                    slider.style.transform = `translateX(${translateX}px)`;
                }

                rowScrollLeftButton.addEventListener("click", function () {
                    if (sayac < 0) {
                        slider.style.transition = "transform 0.5s ease-in-out";
                        updateSliderWidth();
                        sayac++;
                        updateSliderPosition();
                    } else {
                        sayac = -(sayacSliderDiv / 6) + 1;
                        slider.style.transition = "none";
                        updateSliderWidth();
                        updateSliderPosition();
                    }
                });

                rowScrollRightButton.addEventListener("click", function () {
                    if (sayac > -(sayacSliderDiv / 6) + 1) {
                        slider.style.transition = "transform 0.5s ease-in-out";
                        updateSliderWidth();
                        sayac--;
                        updateSliderPosition();
                    } else {
                        sayac = 0;
                        slider.style.transition = "none";
                        updateSliderWidth();
                        updateSliderPosition();
                    }
                });

                window.addEventListener("resize", function () {
                    updateSliderWidth();
                    updateSliderPosition();
                });
            });
        }
    }

    function handleSelamPage() {
        const formConteiner = document.querySelector(".form_conteiner");
        const former = formConteiner.querySelector(".form");

        former.addEventListener("submit", function (event) {
            event.preventDefault();
            const yıl = event.target[0].value;
            const konu = event.target[1].value;
            const files = event.target[2].files;
            const fileArray = Array.from(files);

            fileArray.forEach(file => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const fileName = file.name;
                    const fileType = file.type;
                    const fileContent = e.target.result;
                    let tür;

                    if (fileType.startsWith('image/')) {
                        tür = "fotoğraflar";
                    } else if (fileType.startsWith('video/')) {
                        tür = "videolar";
                    } else {
                        tür = "bilinmeyen";
                    }

                    if (tür === "bilinmeyen") {
                        alert("Geçersiz dosya türü, lütfen fotoğraf ya da video yükleyiniz.");
                    } else {
                        checkIfExists(yıl, konu, fileContent, fileName, tür);
                        clearForm(former);
                    }
                };
                reader.readAsDataURL(file);
            });
        });
    }

    function clearForm(form) {
        // Temizleme işlemi
        form.querySelectorAll("input[type='text'], input[type='number']").forEach(input => {
            input.value = '';
        });
        form.querySelectorAll("input[type='file']").forEach(input => {
            input.value = '';
        });
    }

    function checkIfExists(yıl, konu, fileContent, fileName, tür) {
        const transaction = db.transaction([tür], "readonly");
        const objectStore = transaction.objectStore(tür);
        const index = objectStore.index("fileNameIndex"); // create an index for `fileName`
        const query = objectStore.openCursor();

        query.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.yıl === yıl && cursor.value.file === fileContent && cursor.value.fileName === fileName) {
                    console.log("Bu veri zaten mevcut.");
                    if (cursor.value.konu !== konu) {
                        // 'konu' değerini güncelle
                        cursor.value.konu += konu;

                        // Güncellenmiş objeyi veritabanına kaydet
                        const transaction = db.transaction([tür], "readwrite");
                        const objectStore = transaction.objectStore(tür);
                        const putRequest = objectStore.put(cursor.value);

                        putRequest.onsuccess = function () {
                            console.log("Objenin konusu güncellendi.");
                        };

                        putRequest.onerror = function () {
                            console.error("Objeyi güncellerken bir hata oluştu.");
                        };
                    }
                    console.log(cursor.value.konu);
                    return; // Exit if data already exists
                }
                cursor.continue();
            } else {
                // No duplicate found, proceed to add data
                addData(yıl, konu, fileContent, fileName, tür);
            }
        };

        query.onerror = function () {
            console.log("Veri kontrol hatası");
        };
    }

    function addData(yıl, konu, fileContent, fileName, tür) {
        const transaction = db.transaction([tür], "readwrite");
        const objectStore = transaction.objectStore(tür);
        const request = objectStore.add({ yıl, konu, file: fileContent, fileName });

        request.onsuccess = function () {
            console.log("Veri eklendi");
        };

        request.onerror = function () {
            console.log("Veri ekleme hatası");
        };
    }

    function handleFotograflarPage() {
        const transaction = db.transaction(["fotoğraflar"], "readonly");
        const objectStore = transaction.objectStore("fotoğraflar");
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            const fotograflar = event.target.result;

            fotograflar.forEach(fotograf => {
                appContentToPage(fotograf.id, fotograf.yıl, fotograf.file, fotograf.fileName, fotograflar, "img");
            });
        };

        request.onerror = function (event) {
            console.log("Veri çekme hatası:", event);
        };
    }

    function handleVideolarPage() {
        const transaction = db.transaction(["videolar"], "readonly");
        const objectStore = transaction.objectStore("videolar");
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            const videolar = event.target.result;

            videolar.forEach(video => {
                appContentToPage(video.id, video.yıl, video.file, video.fileName, videolar, "video");
            });
        };

        request.onerror = function (event) {
            console.log("Veri çekme hatası:", event);
        };
    }

    function appContentToPage(i, yıl, file, fileName, storageData, tür) {
        let existingYearDiv = Array.from(document.querySelector(".main").querySelectorAll(".year")).find(yearDiv => yearDiv.querySelector(".title").innerText === yıl);
        let isCheck = true;

        if (!existingYearDiv) {
            const year = document.createElement('div');
            const grid = document.createElement('div');
            const mainHeaderConteiner = document.createElement('div');
            const mainHeader = document.createElement('div');
            const title = document.createElement('div');

            year.classList.add("year");
            grid.classList.add("grid");
            mainHeaderConteiner.classList.add("main_header_conteiner");
            mainHeader.classList.add("main_header");
            title.classList.add("title");
            title.innerHTML = yıl;

            document.querySelector(".main").appendChild(year).appendChild(mainHeaderConteiner).appendChild(mainHeader).appendChild(title);
            year.appendChild(grid);

            existingYearDiv = year;
        }

        for (let j = i + 1; j < storageData.length; j++) {
            if (storageData[j][0] === yıl && storageData[j][3] === fileName) {
                isCheck = false;
                break;
            }
        }

        if (isCheck) {
            const contentcontainer = document.createElement('div');
            const contentDiv = document.createElement('div');
            const contentA = document.createElement('a');
            const contentElement = document.createElement(tür);
            const contentHover = document.createElement('div');
            const contentFavoriteTab = document.createElement('button');
            const contentFavoriteTabIcon = document.createElement('img');
            const contentClearTab = document.createElement('button');
            const contentClearTabIcon = document.createElement('img');

            contentDiv.classList.add("content");
            contentA.classList.add("content_a");
            contentA.href = file;
            contentElement.src = file;
            contentHover.classList.add("content_hover");
            contentFavoriteTab.classList.add("content_favorite_tab");
            contentFavoriteTabIcon.classList.add("content_favorite_tab_icon")
            contentClearTab.classList.add("content_clear_tab");
            contentClearTabIcon.classList.add("content_clear_tab_icon");
            contentClearTabIcon.src = "close icon.png";
            displayNone(contentFavoriteTab);
            displayNone(contentClearTab);

            existingYearDiv.querySelector(".grid").appendChild(contentcontainer).appendChild(contentDiv).appendChild(contentA).appendChild(contentElement);
            contentDiv.appendChild(contentHover).appendChild(contentFavoriteTab).appendChild(contentFavoriteTabIcon);
            contentHover.appendChild(contentClearTab).appendChild(contentClearTabIcon);
            
            let hoverTimeout;
            const hoverClass = `${tür}_hover`;

            contentDiv.addEventListener('mouseenter', function (e) {
                hoverTimeout = setTimeout(function () {
                    contentDiv.classList.add(hoverClass);
                    displayBlock(contentFavoriteTab);
                    displayBlock(contentClearTab);
                    if (tür === "video") {
                        contentElement.play();
                    }
                }, 500);
            });

            contentDiv.addEventListener('mouseleave', function (e) {
                clearTimeout(hoverTimeout);
                contentDiv.classList.remove(hoverClass);
                displayNone(contentFavoriteTab);
                displayNone(contentClearTab);
                if (tür === "video") {
                    contentElement.pause();
                    contentElement.currentTime = 0;
                }
            });
        }
    }

    function displayBlock(element) {
        element.classList.remove("display_none");
        element.classList.add("display_block");
    }

    function displayNone(element) {
        element.classList.remove("display_block");
        element.classList.add("display_none");
    }

});
