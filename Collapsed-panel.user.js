// ==UserScript==
// @name         Collapsed panel
// @license      MIT
// @namespace    argustelecom.ru
// @version      1.2
// @description  Collapsed panel
// @author       Andy BitOff
// @include      *support.argustelecom.ru*
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @run-at       document-start
// ==/UserScript==

/* RELEASE NOTES
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
    $panels = $('div.code.panel:has(div.codeHeader.panelHeader):not(.aui-button)');
    makePanels();
    observer.observe($obsrvContainer.get(0), {childList: true})
  }

  function makePanels() {
    $panels.each(function(){
      const $pnlHeader = $(this).find('>div.codeHeader.panelHeader');
      if ($pnlHeader.hasClass('cp-header')){return};
      const $pnlContent = $(this).find('div.codeContent.panelContent');
      $pnlContent.addClass('cp-pnl-content');
      const $preContent = $pnlContent.find('> pre');
      $pnlHeader.addClass('aui-button cp-header');
      const $pnlHeaderImg = $pnlHeader.prepend(`<div class="cp-header-img">»</div>`).find('div.cp-header-img');
      $preContent.height($pnlContent.height()).addClass('cp-pre-content');
      $preContent.resize(function(){$pnlContent.height($preContent.height())});
      $pnlHeader.click(function(event){event.stopPropagation(); togglePanel($pnlHeaderImg, $preContent)});
      if (startCollapsed === null){
        togglePanel($pnlHeaderImg, $preContent, (($preContent.text() || '').match(/\n/gmi) || []).length >= maxLines);
      } else {
        togglePanel($pnlHeaderImg, $preContent, startCollapsed);
      }
    });
  }

  function togglePanel($header, $content, collapse) {
    if (collapse === undefined){
      $header.toggleClass('cp-expanded-head cp-collapsed-head');
      $content.toggleClass('cp-expanded-content cp-collapsed-content');
    } else {
      if (collapse){
        $header.removeClass('cp-expanded-head');
        $content.removeClass('cp-expanded-content');
        $header.addClass('cp-collapsed-head');
        $content.addClass('cp-collapsed-content');
      } else {
        $header.removeClass('cp-collapsed-head');
        $content.removeClass('cp-collapsed-content');
        $header.addClass('cp-expanded-head');
        $content.addClass('cp-expanded-content');
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
        transition: height .3s;
      }
      .cp-collapsed-content{
        height: 0 !important;
        transition: height .3s;
      }
    `)
  }


})(window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver);