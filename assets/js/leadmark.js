/*!
=========================================================
* LeadMark Landing page
=========================================================

* Copyright: 2019 DevCRUD (https://devcrud.com)
* Licensed: (https://devcrud.com/licenses)
* Coded by www.devcrud.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// smooth scroll
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                window.location.hash = hash;
            });
        } 
    });
});

// protfolio filters
$(window).on("load", function() {
    var t = $(".portfolio-container");
    t.isotope({
        filter: ".new",
        animationOptions: {
            duration: 750,
            easing: "linear",
            queue: !1
        }
    }), $(".filters a").click(function() {
        $(".filters .active").removeClass("active"), $(this).addClass("active");
        var i = $(this).attr("data-filter");
        return t.isotope({
            filter: i,
            animationOptions: {
                duration: 750,
                easing: "linear",
                queue: !1
            }
        }), !1
    })
})

// portfolio preview popup
$(document).ready(function() {
    var modal = $(
        '<div class="video-preview-modal" aria-hidden="true">' +
            '<div class="video-preview-backdrop" data-video-preview-close></div>' +
            '<div class="video-preview-dialog" role="dialog" aria-modal="true" aria-label="Portfolio preview">' +
                '<button class="video-preview-close" type="button" aria-label="Close preview">&times;</button>' +
                '<div class="video-preview-frame"></div>' +
            '</div>' +
        '</div>'
    );

    $("body").append(modal);

    var frame = modal.find(".video-preview-frame");
    var lastFocusedLink = null;

    function youtubeEmbedUrl(url) {
        var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
        if (!match) return "";

        return "https://www.youtube.com/embed/" + match[1] + "?autoplay=1&controls=1&rel=0";
    }

    function facebookUrl(url) {
        if (!/facebook\.com|fb\.watch/.test(url)) return "";

        return url
            .replace("https://web.facebook.com/", "https://www.facebook.com/")
            .replace("http://web.facebook.com/", "https://www.facebook.com/")
            .replace("https://m.facebook.com/", "https://www.facebook.com/")
            .replace("http://m.facebook.com/", "https://www.facebook.com/");
    }

    function facebookPluginUrl(url) {
        if (/facebook\.com\/plugins\//.test(url)) return url;

        return "";
    }

    function facebookEmbedUrl(url) {
        var normalizedUrl = facebookUrl(url);
        var pluginUrl = facebookPluginUrl(normalizedUrl);

        if (pluginUrl && /\/plugins\/video\.php/.test(pluginUrl)) return pluginUrl;
        if (!normalizedUrl) return "";
        if (!/\/videos\/|\/share\/v\/|\/reel\//.test(normalizedUrl)) return "";

        return "https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(normalizedUrl) + "&show_text=false&autoplay=true&width=1280";
    }

    function facebookPostEmbedUrl(url) {
        var normalizedUrl = facebookUrl(url);
        var pluginUrl = facebookPluginUrl(normalizedUrl);

        if (pluginUrl && /\/plugins\/post\.php/.test(pluginUrl)) return pluginUrl;
        if (!normalizedUrl) return "";

        if (/\/photo|\/photo\.php|\/share\/p\/|\/share\/a\/|\/media\/set|\/posts\//.test(normalizedUrl)) {
            return "https://www.facebook.com/plugins/post.php?href=" + encodeURIComponent(normalizedUrl) + "&show_text=true&width=750";
        }

        return "";
    }

    function facebookAlbumUrl(url) {
        var normalizedUrl = facebookUrl(url);

        return !!normalizedUrl && /\/media\/set|\/share\/a\//.test(normalizedUrl);
    }

    function googleDriveFileId(url) {
        if (!/drive\.google\.com/.test(url)) return "";

        var fileMatch = url.match(/\/file\/d\/([^/]+)/);
        var idMatch = url.match(/[?&]id=([^&]+)/);

        return fileMatch ? fileMatch[1] : (idMatch ? idMatch[1] : "");
    }

    function googleDriveEmbedUrl(url) {
        var fileId = googleDriveFileId(url);

        return fileId ? "https://drive.google.com/file/d/" + fileId + "/preview" : "";
    }

    function directVideoUrl(url) {
        return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) ? url : "";
    }

    function directImageUrl(url) {
        return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) ? url : "";
    }

    function escapeHtml(text) {
        return $("<div>").text(text || "").html();
    }

    function isAlbumButton(link) {
        return $.trim(link.text()).toUpperCase().indexOf("VIEW ALBUM") !== -1;
    }

    function albumPreviewMarkup(link) {
        var item = link.closest(".portfolio-item");
        var image = item.find("img").attr("src") || "";
        var title = $.trim(item.find(".title").text()) || "Photo album";
        var subtitle = $.trim(item.find(".subtitle").text()) || "View the full album on Facebook.";
        var url = link.attr("href");

        return '<div class="album-preview-card">' +
            '<div class="album-preview-cover">' +
                '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(title) + '">' +
            '</div>' +
            '<div class="album-preview-details">' +
                '<h3>' + escapeHtml(title) + '</h3>' +
                '<p>' + escapeHtml(subtitle) + '</p>' +
                '<a class="video-preview-primary" href="' + escapeHtml(url) + '" target="_blank" rel="noopener">Open album on Facebook</a>' +
            '</div>' +
        '</div>';
    }

    function isFacebookPostPreview(url) {
        return !!facebookPostEmbedUrl(url) && !facebookEmbedUrl(url);
    }

    function isGoogleDrivePreview(url) {
        return !!googleDriveEmbedUrl(url);
    }

    function getPreviewMarkup(url, link) {
        var directUrl = directVideoUrl(url);
        var directImage = directImageUrl(url);
        var embedUrl = youtubeEmbedUrl(url) || facebookEmbedUrl(url) || googleDriveEmbedUrl(url) || facebookPostEmbedUrl(url);

        if (link && isAlbumButton(link)) {
            return albumPreviewMarkup(link);
        }

        if (directUrl) {
            return '<video class="video-preview-video" src="' + directUrl + '" controls autoplay playsinline preload="metadata"></video>';
        }

        if (directImage) {
            return '<img class="video-preview-image" src="' + directImage + '" alt="">';
        }

        if (embedUrl) {
            return '<iframe src="' + embedUrl + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
        }

        return "";
    }

    function openPortfolioPreview(link) {
        var url = link.attr("href");
        var markup = getPreviewMarkup(url, link);

        if (!markup) return false;

        lastFocusedLink = link;
        modal.toggleClass("is-post-preview", isFacebookPostPreview(url) && !isAlbumButton(link));
        modal.toggleClass("is-album-preview", isAlbumButton(link));
        modal.toggleClass("is-drive-preview", isGoogleDrivePreview(url));
        frame.html(markup);
        modal.addClass("is-open").attr("aria-hidden", "false");
        $("body").addClass("has-video-preview-open");
        modal.find(".video-preview-close").trigger("focus");

        return true;
    }

    function closeVideoPreview() {
        modal.removeClass("is-open").attr("aria-hidden", "true");
        modal.removeClass("is-post-preview");
        modal.removeClass("is-album-preview");
        modal.removeClass("is-drive-preview");
        $("body").removeClass("has-video-preview-open");
        frame.empty();

        if (lastFocusedLink) {
            lastFocusedLink.trigger("focus");
        }
    }

    $(".portfolio-container").on("click", "a", function(event) {
        var link = $(this);

        if (openPortfolioPreview(link)) {
            event.preventDefault();
        }
    });

    modal.on("click", ".video-preview-close, [data-video-preview-close]", closeVideoPreview);

    $(document).on("keydown", function(event) {
        if (event.key === "Escape" && modal.hasClass("is-open")) {
            closeVideoPreview();
        }
    });
});

// discreet visitor counter, active only after the site is online
$(document).ready(function() {
    var counter = $("#visitor-count");
    var hostname = window.location.hostname;
    var isLocal = !hostname || hostname === "localhost" || hostname === "127.0.0.1";

    if (!counter.length || isLocal) {
        return;
    }

    fetch("https://visitor.6developer.com/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            domain: hostname,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page_path: window.location.pathname,
            page_title: document.title,
            referrer: document.referrer
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data && typeof data.totalCount !== "undefined") {
            counter.text(data.totalCount);
        }
    })
    .catch(function() {
        fetch("https://visitor.6developer.com/visit?domain=" + encodeURIComponent(hostname))
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data && typeof data.totalCount !== "undefined") {
                    counter.text(data.totalCount);
                }
            });
    });
});
