// ==UserScript==
// @name         Collapsed panel
// @license      MIT
// @namespace    argustelecom.ru
// @version      1.0
// @description  Collapsed panel
// @author       Andy BitOff
// @include      *support.argustelecom.ru*
// @grant        none
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @run-at       document-start
// ==/UserScript==


(function (MutationObserver) {
  'use strict';

  const startCollapsed = false;

  let $observContainer;
  let $panels;
  const observer = new MutationObserver(mutationCallback);
  const startHeaderClass = (startCollapsed) ? 'cp-collapsed-head' : 'cp-expanded-head';
  const startContentClass = (startCollapsed) ? 'cp-collapsed-content' : 'cp-expanded-content';

  const timId = setInterval(function() {
    if ($('body').length === 0){ return };
    clearInterval(timId);
    new MutationObserver(function(){
      $observContainer = $('div#activitymodule div.mod-content div#issue_actions_container');
      if ($observContainer.length === 0){ return };
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
    observer.observe($observContainer.get(0), {childList: true})
  }

  function makePanels() {
    $panels.each(function(){
      const $pnlHeader = $(this).find('>div.codeHeader.panelHeader');
      if ($pnlHeader.hasClass('cp-header')){return};
      $pnlHeader.addClass('aui-button cp-header');
      const $pnlHeaderImg = $pnlHeader.prepend(`<div class="cp-header-img ${startHeaderClass}">»</div>`).find('div.cp-header-img');
      const $pnlContent = $(this).find('div.codeContent.panelContent');
      $pnlContent.addClass('cp-pnl-content');
      const $preContent = $pnlContent.find('> pre');
      $preContent.height($pnlContent.height()).addClass('cp-pre-content ' + startContentClass);
      $preContent.resize(function(){$pnlContent.height($preContent.height())});
      $pnlHeader.click(function(){
        $preContent.toggleClass('cp-expanded-content cp-collapsed-content');
        $pnlHeaderImg.toggleClass('cp-expanded-head cp-collapsed-head');
      })
    });

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