<script setup>
import HeaderComponent from '@/components/HeaderComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';
</script>

<template>
  <main class="bg-white min-h-screen">
    <HeaderComponent />

    <!-- Privacy Policy Header -->
    <section class="py-24 bg-gradient-to-b from-orange-50 to-white">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <h1 v-scroll-animate="'fade-in-up'" class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Política de Privacitat
        </h1>
        <div class="w-24 h-1 bg-orange-500 mx-auto mb-8"></div>
        <p v-scroll-animate="'fade-in-up'" class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Informació sobre com gestionem les teves dades personals
        </p>
      </div>
    </section>

    <!-- Privacy Policy Content -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 prose lg:prose-lg">
        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Introducció</h2>
          <p class="text-gray-700 mb-4">
            Aquesta Política de Privacitat descriu com Fusteria i Mobles Joan Ribalta 
            recopila, utilitza i comparteix la 
            vostra informació personal quan visiteu el nostre lloc web: 
            <a href="https://www.moblesjoanribalta.com/#/" class="text-orange-600 hover:text-orange-800">
              www.fusteriamoblesjoanribalta.com
            </a>
            o contacteu amb nosaltres per als nostres serveis.
          </p>
          <p class="text-gray-700">
            En utilitzar el nostre lloc web o proporcionar-nos informació personal, 
            accepteu els termes i condicions d'aquesta Política de Privacitat.
          </p>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Informació que recopilem</h2>
          <p class="text-gray-700 mb-4">
            Recopilem informació personal quan ens la proporcioneu voluntàriament:
          </p>
          <ul class="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>
              <span class="font-medium">Informació de contacte:</span> com ara nom, adreça de correu electrònic, 
              número de telèfon, adreça postal quan ompliu un formulari de contacte.
            </li>
            <li>
              <span class="font-medium">Contingut de les comunicacions:</span> qualsevol informació que ens 
              proporcioneu en els missatges que ens envieu.
            </li>
            <li>
              <span class="font-medium">Informació tècnica:</span> Recopilem automàticament dades com 
              l'adreça IP, informació del navegador, pàgines visitades i temps de permanència al nostre lloc web.
            </li>
          </ul>
          <p class="text-gray-700">
            No recopilem dades personals sensibles a través del nostre lloc web.
          </p>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Com utilitzem la vostra informació</h2>
          <p class="text-gray-700 mb-4">
            Utilitzem la informació personal recopilada per a:
          </p>
          <ul class="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Respondre a les vostres consultes i sol·licituds d'informació</li>
            <li>Proporcionar i millorar els nostres serveis</li>
            <li>Enviar-vos pressupostos sol·licitats i informació relacionada</li>
            <li>Personalitzar la vostra experiència i oferir-vos contingut rellevant</li>
            <li>Complir amb les nostres obligacions legals</li>
            <li>Prevenir el frau i garantir la seguretat del nostre lloc web</li>
          </ul>
          <p class="text-gray-700">
            La base legal per al tractament de les vostres dades personals és: el compliment d'un contracte, 
            el consentiment, el compliment d'obligacions legals i els interessos legítims de l'empresa.
          </p>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Cookies i tecnologies similars</h2>
          <p class="text-gray-700 mb-4">
            El nostre lloc web utilitza cookies i tecnologies similars per millorar el vostre 
            accés als nostres serveis i identificar-vos com a usuari recurrent. Podeu controlar 
            les cookies a través de la configuració del vostre navegador o utilitzant les eines 
            proporcionades al nostre lloc.
          </p>
          <p class="text-gray-700">
            Utilitzem tant cookies essencials necessàries per al funcionament del lloc com cookies 
            analítiques que ens ajuden a entendre com els usuaris interactuen amb el nostre lloc web.
          </p>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Compartició d'informació personal</h2>
          <p class="text-gray-700 mb-4">
            No venem ni lloguem la vostra informació personal a tercers. Podem compartir la vostra 
            informació personal en les següents circumstàncies:
          </p>
          <ul class="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Amb proveïdors de serveis que treballen en nom nostre i sota confidencialitat</li>
            <li>Quan sigui necessari per complir amb la llei, una ordre judicial o un procés legal</li>
            <li>Per protegir els nostres drets i propietat</li>
            <li>Amb el vostre consentiment explícit o a petició vostra</li>
          </ul>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Els vostres drets</h2>
          <p class="text-gray-700 mb-4">
            D'acord amb la normativa de protecció de dades, teniu dret a:
          </p>
          <ul class="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Accedir a les vostres dades personals</li>
            <li>Rectificar dades inexactes o incompletes</li>
            <li>Sol·licitar la supressió de les vostres dades personals</li>
            <li>Oposar-vos al tractament de les vostres dades</li>
            <li>Limitar el tractament en determinades circumstàncies</li>
            <li>Portabilitat de les vostres dades</li>
            <li>Retirar el consentiment en qualsevol moment</li>
          </ul>
          <p class="text-gray-700">
            Per exercir aquests drets, podeu contactar-nos a: <span class="text-orange-600">info@moblesjoanribalta.com</span>
          </p>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Període de conservació de les dades</h2>
          <p class="text-gray-700">
            Conservarem les vostres dades personals durant el temps necessari per complir amb 
            les finalitats per a les quals es van recopilar, inclòs el compliment de requisits 
            legals, comptables o de presentació d'informes, i mentre mantinguem una relació comercial.
          </p>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Canvis a aquesta política</h2>
          <p class="text-gray-700">
            Podem actualitzar aquesta política de privacitat ocasionalment per reflectir canvis 
            en les nostres pràctiques o per altres raons operatives, legals o regulatòries. 
            La data de la darrera actualització es mostrarà al principi d'aquesta política. 
            Us animem a revisar periòdicament aquesta política per estar informat sobre com 
            protegim la vostra informació.
          </p>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Contacte</h2>
          <p class="text-gray-700">
            Si teniu preguntes sobre aquesta Política de Privacitat, o voleu exercir els vostres 
            drets de protecció de dades, podeu contactar-nos a:
          </p>
          <div class="bg-gray-50 p-6 rounded-lg mt-4">
            <h3 class="font-bold text-lg mb-2">Fusteria i Mobles Joan Ribalta</h3>
            <p class="text-gray-700 mb-1">Adreça: Carrer de Sant Eloi, 21, 25300 Tàrrega, Lleida</p>
            <p class="text-gray-700 mb-1">Telèfon: 666 59 08 33</p>
            <p class="text-gray-700">Correu electrònic: info@moblesjoanribalta.com</p>
          </div>
        </div>

        <div v-scroll-animate="'fade-in-up'" class="text-gray-500 text-sm">
          <p>Darrera actualització: 24 de març del 2025</p>
        </div>
      </div>
    </section>

    <FooterComponent />
  </main>
</template>
