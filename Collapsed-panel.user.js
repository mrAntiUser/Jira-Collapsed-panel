// ==UserScript==
// @name         Collapsed panel
// @license      MIT
// @namespace    argustelecom.ru
// @version      1.5
// @description  Collapsed panel
// @author       Andy BitOff
// @include      *support.argustelecom.ru*
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @run-at       document-start
// ==/UserScript==

/* RELEASE NOTES
  1.5
    Теперь так же скрываются и панели, а не только code. Пенель сворачивается с любым контентом, однако
      панели внутри панелей не делаются сворачиваемыми
  1.4.1
    Добавлен падинг для панелей без заголовка
  1.4
    Добавлена настройка минимального количества строк при которых
      создается заголовок для панелей без него. default 3
  1.3
    Панели без заголовка теперь тоже умеют сворачиваться
  1.2
    баг если панель в описании таска
  1.1
    Auto collapse when <maxLines> line or more.
      <maxLines> default 15
  1.0
    Release
*/

(function (MutationObserver) {
  'use strict';

  // true  - collapse all on start
  // false - expand all on start
  // null  - auto. Collapse when <maxLines> line or more
  const startCollapsed = null;
  const maxLines = 15;
  const minLines = 3;

  let $obsrvContainer, $panels;
  const observer = new MutationObserver(mutationCallback);

  const timId = setInterval(function() {
    if ($('body').length === 0){ return };
    clearInterval(timId);
    new MutationObserver(function(){
      $obsrvContainer = $('div#activitymodule div.mod-content div#issue_actions_container');
      if ($obsrvContainer.length === 0){ return };
      this.disconnect();
      addNewCss();
      observerStart();
    }).observe($('body').get(0), {childList: true});
  }, 100);

  function mutationCallback() {
    observer.disconnect();
    observerStart();
  }

  function observerStart() {
    $panels = $('div.panel:not(.aui-button)');
    makePanels();
    observer.observe($obsrvContainer.get(0), {childList: true})
  }

  function makePanels() {
    $panels.each(function(){
      let $pnlHeader = $(this).find('>div.panelHeader');
      const $pnlContent = $(this).find('div.panelContent');
      if ($pnlContent.length === 0){return}
      let $pnlBodyContent = $pnlContent.find('> pre');
      if ($pnlBodyContent.length === 0){
        $pnlBodyContent = $pnlContent.children().detach();
        $pnlContent.append($('<div class="cp-content-for-panel"></div>')).find('div.cp-content-for-panel').append($pnlBodyContent);
      }
      const contentLinesCount = (($pnlBodyContent.text() || '').match(/\n/gmi) || []).length;

      if ($(this).parents('div.panel').length !== 0){return}
      let $headerTxt;
      const isNewHeader = $pnlHeader.length === 0;
      if (isNewHeader && contentLinesCount <= minLines) {return}
      if (isNewHeader){
        $pnlHeader = $(this).prepend(`<div class="panelHeader cp-spnl-header">
            <div class="cp-header-img cp-spnl-header-img">»</div><d class="cp-spnl-txt"></d></div>`).find('div.cp-spnl-header');
        $headerTxt = $pnlHeader.find('>d');
      } else{ if ($pnlHeader.hasClass('cp-header')){return} }

      $pnlContent.addClass('cp-pnl-content');
      $pnlBodyContent.height($pnlContent.height()).addClass('cp-pre-content');
      $pnlBodyContent.resize(function(){$pnlContent.height($pnlBodyContent.height())});

      $pnlHeader.addClass('aui-button cp-header');
      $pnlHeader.find('>b').addClass('cp-header-txt');
      if (!isNewHeader){$pnlHeader.prepend(`<div class="cp-header-img">»</div>`)}
      const $pnlHeaderImg = $pnlHeader.find('div.cp-header-img');
      $pnlHeader.click(function(event){event.stopPropagation(); togglePanel($pnlHeaderImg, $pnlBodyContent, $headerTxt)});
      if (isNewHeader && (startCollapsed || contentLinesCount >= maxLines)){$headerTxt.text('  [' + contentLinesCount + ']')}
      if (startCollapsed === null){
        togglePanel($pnlHeaderImg, $pnlBodyContent, $headerTxt, contentLinesCount >= maxLines);
      } else {
        togglePanel($pnlHeaderImg, $pnlBodyContent, $headerTxt, startCollapsed);
      }
    });
  }

  function togglePanel($header, $content, $headerTxt, collapse) {
    if (collapse === undefined){
      $header.toggleClass('cp-expanded-head cp-collapsed-head');
      $content.toggleClass('cp-expanded-content cp-collapsed-content');
      if ($headerTxt){$headerTxt.toggleClass('cp-spnl-txt-collapse cp-spnl-txt-expand');}
    } else {
      if (collapse){
        $header.removeClass('cp-expanded-head');
        $content.removeClass('cp-expanded-content');
        $header.addClass('cp-collapsed-head');
        $content.addClass('cp-collapsed-content');
        if ($headerTxt){
          $headerTxt.removeClass('cp-spnl-txt-expand');
          $headerTxt.addClass('cp-spnl-txt-collapse');
        }
      } else {
        $header.removeClass('cp-collapsed-head');
        $content.removeClass('cp-collapsed-content');
        $header.addClass('cp-expanded-head');
        $content.addClass('cp-expanded-content');
        if ($headerTxt){
          $headerTxt.removeClass('cp-spnl-txt-collapse');
          $headerTxt.addClass('cp-spnl-txt-expand');
        }
      }
    }
  }

  function newCssClass(cssClass){
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssClass));
    head.appendChild(style);
  }

  function addNewCss(){
    newCssClass(`
      .cp-header{
        width: 100%;
        padding: 3px 12px;
      }
      .cp-header-txt{
        top: -2px;
        position: relative;
      }
      .cp-header-img{
        margin-right: 10px;
        transform: rotate(0deg);
        font-size: 150%;
        display: inline-block;
      }
      .cp-pnl-content{
        padding: 0 0 0 10px;
        overflow: hidden;
      }
      .cp-pre-content{
        max-height: none !important;
        resize: vertical;
      }
      .cp-expanded-head{
        transform: rotate(0deg) !important;
        transition: .3s;
      }
      .cp-collapsed-head{
        transform: rotate(90deg) !important;
        transition: .3s;
      }
      .cp-expanded-content{
        padding-bottom: 10px;
        padding-top: 10px;
        transition: .3s;
      }
      .cp-collapsed-content{
        padding-bottom: 0;
        padding-top: 0;
        height: 0 !important;
        transition: .3s;
      }
      .cp-spnl-header{
        border-bottom-width: 1px;
        height: 15px;
      }
      .cp-spnl-header-img{
        top: -8px;
        position: relative;
        font-size: 120%;
      }
      .cp-spnl-txt{
        vertical-align: text-top;
        font-size: 11px;
        top: -10px;
        position: relative;
      }
      d.cp-spnl-txt-collapse:before {
        content: "развернуть";
      }
      d.cp-spnl-txt-expand:before {
        content: "свернуть";
      }
    `)
  }


})(window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver);