"use client";

import { I18nProviderClient } from "@/locales/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect } from "react";

export const Providers = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  useEffect(() => {
    // Vérifie si le script n'est pas déjà ajouté
    if (!document.getElementById("GhzM7vlU1LEovWCl8qWTt")) {
      const script = document.createElement("script");
      script.innerHTML = `
        (function(){
          if(!window.chatbase||window.chatbase("getState")!=="initialized"){
            window.chatbase=(...arguments)=>{
              if(!window.chatbase.q){window.chatbase.q=[]}
              window.chatbase.q.push(arguments)
            };
            window.chatbase=new Proxy(window.chatbase,{
              get(target,prop){
                if(prop==="q"){return target.q}
                return(...args)=>target(prop,...args)
              }
            })
          }
          const onLoad=function(){
            const script=document.createElement("script");
            script.src="https://www.chatbase.co/embed.min.js";
            script.id="GhzM7vlU1LEovWCl8qWTt";
            script.domain="www.chatbase.co";
            document.body.appendChild(script)
          };
          if(document.readyState==="complete"){onLoad()}
          else{window.addEventListener("load",onLoad)}
        })();
      `;
      document.body.appendChild(script);
    }
    // Nettoyage si besoin
    return () => {
      const script = document.getElementById("GhzM7vlU1LEovWCl8qWTt");
      if (script) {
        script.remove();
      }
    };
  }, []);
  return (
    <NuqsAdapter>
      <I18nProviderClient locale={params.locale}>{children}</I18nProviderClient>
    </NuqsAdapter>
  );
};
