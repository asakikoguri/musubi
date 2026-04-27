
(function() {
    // 1. タイピングアニメーション
    const initJump = () => {
        const target = document.getElementById('js-typing');
        if (!target) return;
        const text = target.textContent.trim();
        target.innerHTML = ""; 
        [...text].forEach((char, index) => {
            const span = document.createElement('span');
            if (char !== "＼" && char !== "／") {
                span.classList.add('jump');
                span.style.animationDelay = `${index * 0.1}s`;
            } else {
                span.classList.add('symbol');
                span.style.margin = "0 10px";
            }
            span.textContent = char === " " ? "\u00A0" : char;
            target.appendChild(span);
        });
    };

    // 2. フェードイン監視（IntersectionObserver）
    const initObserver = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // sticky対策：画面内に入っているか、あるいはスクロール位置が対象を超えていたら表示
                if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -10% 0px', // 下から10%の位置に来たら発火
            threshold: 0
        });

        document.querySelectorAll('.style-item').forEach((item) => {
            observer.observe(item);
        });
    };

// 3. プランセクションのカルーセル
const initPlanCarousel = () => {
    const container = document.getElementById('plan-container');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    if(!container) return;

    const getScrollAmount = () => container.offsetWidth;

    // ★ 初期位置を「1枚目」に設定する関数
    const setInitialPosition = () => {
        // 0はコンテナの左端（1枚目の先頭）を指します
        container.scrollLeft = 0;
    };

    // 初回実行
    setInitialPosition();

    // 以前のボタンイベント
    prevBtn?.addEventListener('click', () => {
        container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });
    
    nextBtn?.addEventListener('click', () => {
        container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    container.addEventListener('scroll', () => {
        const itemWidth = container.offsetWidth;
        const index = Math.round(container.scrollLeft / itemWidth);
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === index);
        });
    }, { passive: true });

    // リサイズ時にも位置がズレないようにケア
    window.addEventListener('resize', setInitialPosition);
};
    // 初期化実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initJump();
            initObserver();
            initPlanCarousel();
        });
    } else {
        initJump();
        initObserver();
        initPlanCarousel();
    }
})();



// --- スクロール制御系 ---
const panels = document.querySelectorAll('.panel');
let isScrolling = false;




// A. メニュークリック（area-anchorへ飛ばす）

document.querySelectorAll('.nav-menu a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const target = document.querySelector(href); 
        if (target) {
            e.preventDefault();
            isScrolling = true;
            // area-anchorの絶対座標を計算
            const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
            setTimeout(() => { isScrolling = false; }, 1000);
        }
    });
});




// スタイルカードの動き

const initObserver = () => {
    const items = document.querySelectorAll('.style-item');
    if (items.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // アニメーション開始（is-visibleクラスを付与）
                target.classList.add('is-visible');
                
                // この要素自体の監視はもう不要なので解除
                observer.unobserve(target);

                // 次の要素を取得
                const nextItem = target.nextElementSibling;
                
                // 【重要】0.8sのアニメーションが終わるのを待ってから、次の要素を監視開始
                if (nextItem && nextItem.classList.contains('style-item')) {
                    setTimeout(() => {
                        observer.observe(nextItem);
                    }, 800); // transitionの0.8sと合わせる
                }
            }
        });
    }, {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.2 // 少ししっかり画面に入ってから発火
    });

    // 最初の一つ目だけを監視スタート
    observer.observe(items[0]);
};




// ページトップボタン

window.addEventListener('scroll', function() {
    const pageTop = document.querySelector('.page-top');
    
    // 1. ページ全体の高さ
    const scrollHeight = document.documentElement.scrollHeight;
    // 2. 画面自体の高さ
    const viewHeight = window.innerHeight;
    // 3. 現在のスクロール位置（上端からの距離）
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 「最大までスクロールできる量」を計算
    const maxScroll = scrollHeight - viewHeight;

    // 現在のスクロール位置が、最大スクロール量に達した（＝一番下まで指が止まった）か判定
    // 余裕を持たせて -5px 程度にすると反応が良くなります
    if (scrollTop >= maxScroll - 2) {
        pageTop.classList.add('is-show');
    } else {
        pageTop.classList.remove('is-show');
    }
});






// エピソードカードのドラッグスクロール制御（1300以下の場合

// const initEpisodeScroll = () => {
//     const slider = document.querySelector('.episode-grid');
//     if (!slider) return;

//     const cards = slider.querySelectorAll('.episode-card');
//     if (cards.length >= 2) {
//         const targetCard = cards[1]; 
//         const initialLeft = targetCard.offsetLeft - (slider.clientWidth / 2) + (targetCard.clientWidth / 2);
//         slider.scrollLeft = initialLeft;
//     }

//     let isDown = false;
//     let startX;
//     let scrollLeft;

//     slider.addEventListener('mousedown', (e) => {
//         if (window.innerWidth > 1300) return;

//         isDown = true;
//         slider.classList.add('is-dragging');
        
//         startX = e.pageX - slider.getBoundingClientRect().left;
//         scrollLeft = slider.scrollLeft;
//     });

//     const stopDragging = () => {
//         isDown = false;
//         slider.classList.remove('is-dragging');
//     };

//     slider.addEventListener('mouseleave', stopDragging);
//     slider.addEventListener('mouseup', stopDragging);

//     slider.addEventListener('mousemove', (e) => {
//         if (!isDown || window.innerWidth > 1300) return;
        
//         e.preventDefault();
//         const x = e.pageX - slider.getBoundingClientRect().left;
//         const walk = (x - startX) * 2; 
//         slider.scrollLeft = scrollLeft - walk;
//     });
// };

// document.addEventListener('DOMContentLoaded', initEpisodeScroll);

const initEpisodeScroll = () => {
    const slider = document.querySelector('.episode-grid');
    if (!slider) return;

    // --- 【修正版】Case 02（2枚目）を初期位置にする関数 ---
    const setInitialPosition = () => {
        const cards = slider.querySelectorAll('.episode-card');
        
        if (cards.length >= 2) {
            const targetCard = cards[1]; // 2番目のカード(Case 02)
            
            // コンテナの左端から対象カードまでの距離を計算
            // offsetLeftを使うことで、paddingや幅が変わっても自動追従します
            const scrollPos = targetCard.offsetLeft;

            slider.scrollTo({
                left: scrollPos,
                behavior: 'instant' // 読み込み時は一瞬で移動
            });
        }
    };

    // 初期化の実行
    setInitialPosition();
    window.addEventListener('load', setInitialPosition);
    window.addEventListener('resize', setInitialPosition);

    // --- ドラッグスクロールの制御 ---
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        // ドラッグを有効にするため、一時的にoverflowを許可する（ブラウザ挙動対策）
        slider.style.overflowX = 'auto'; 
        
        isDown = true;
        slider.classList.add('is-dragging');
        startX = e.pageX - slider.getBoundingClientRect().left;
        scrollLeft = slider.scrollLeft;
    });

    const stopDragging = () => {
        isDown = false;
        slider.classList.remove('is-dragging');
        // ドラッグが終わったら再度隠す（必要に応じて）
        // slider.style.overflowX = 'hidden'; 
    };

    slider.addEventListener('mouseleave', stopDragging);
    slider.addEventListener('mouseup', stopDragging);

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.getBoundingClientRect().left;
        const walk = (x - startX) * 2; 
        slider.scrollLeft = scrollLeft - walk;
    });
};

document.addEventListener('DOMContentLoaded', initEpisodeScroll);






// メニューの動き

window.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    // hrefから対象となるセクション要素をすべて取得
    const sections = Array.from(navLinks).map(link => {
        return document.querySelector(link.getAttribute('href'));
    }).filter(el => el !== null);

    const changeActive = () => {
        let activeId = "";
        
        // 現在のスクロール位置（画面の上端から少し余裕を持たせる）
        const scrollPos = window.scrollY + 100; 

        // ページ最上部（Top）の特別判定
        if (window.scrollY < 100) {
            activeId = "top";
        } else {
            // 各セクションの位置を確認し、今どこにいるか特定する
            sections.forEach(section => {
                if (scrollPos >= section.offsetTop) {
                    activeId = section.getAttribute('id');
                }
            });
        }

        // クラスの付け替え
        navLinks.forEach(link => {
            link.classList.remove('is-active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('is-active');
            }
        });
    };

    // スクロール時と読み込み時に実行
    window.addEventListener('scroll', changeActive);
    changeActive();
});


document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.style-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // 親要素の .style-item を探してクラスを切り替え
            const item = card.closest('.style-item');
            item.classList.toggle('is-open');
            
            // コンソールにログを出して動いているか確認（デバッグ用）
            console.log('Clicked!', item.classList.contains('is-open'));
        });
    });
});


// document.addEventListener('DOMContentLoaded', () => {
//     // 1. 確実に ID を持っているセクション要素を取得する
//     // もし section タグを使っていない場合は '.section' など適切なクラス名に変えてください
//     const targets = document.querySelectorAll('section[id], div[id]'); 
//     const bgItems = document.querySelectorAll('.bg-item');
//     const navLinks = document.querySelectorAll('.nav-menu a');

//     // UIを更新する共通関数
//     const updateUI = (id) => {
//         // 背景リストの更新
//         bgItems.forEach(item => {
//             item.classList.toggle('is-active', item.dataset.section === id);
//         });

//         // ナビゲーションメニューの更新
//         navLinks.forEach(link => {
//             // href属性が "#id" と一致するか確認
//             const href = link.getAttribute('href');
//             link.classList.toggle('is-active', href === '#' + id);
//         });
//     };

//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             // 交差（センサーに触れた）した時だけ実行
//             if (entry.isIntersecting) {
//                 updateUI(entry.target.id);
//             }
//         });
//     }, {
//         // 画面の上部 20% 〜 30% の位置を判定線にする設定
//         rootMargin: "0px",
//         threshold: 0
//     });

//     targets.forEach(target => {
//         if (target.id) observer.observe(target);
//     });
// });



window.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('js-hamburger');
  const nav = document.getElementById('js-nav');

  // ボタンが存在するかチェック（これを入れるとエラーで止まらなくなります）
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      this.classList.toggle('is-active');
      nav.classList.toggle('is-active');
    });

    // リンクをクリックしたら閉じる
    const links = document.querySelectorAll('.sp-menu a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-active');
        nav.classList.remove('is-active');
      });
    });
  } else {
    console.error("要素が見つかりませんでした：js-hamburger または js-nav がHTMLにありません");
  }
});



