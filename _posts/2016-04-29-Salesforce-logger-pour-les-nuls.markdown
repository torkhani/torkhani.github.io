---
layout: post
url: "/common/2016/04/29/Salesforce-logger-pour-les-nuls.html"
title:  "Salesforce logger pour les nuls"
author: "Nicolas Pouille"
date:   2016-04-29 14:33:00 +0100
pitch:  "L'objectif de cet article est de voir comment utiliser le logger salesforce pour debug les classes apex."
comments: True
categories: common
---



De temps en temps, quand on touche aux classes apex de Salesforce, ca peut etre utile d'utiliser des logs pour voir un peu ce qui se passe.

Pour cela, on va placer des `system.debug(String)` dans le morceau de code qui nous intéresse.

Ensuite, il va faloir accéder à la page des "journaux de débogage". Ca se passe dans le menu surveillance de l'interface de configuration.
Pour les fainéants, la recherche rapide fonctionne bien pour s'y retrouver dans les menus.
![journaux_de_debug.png](http://aramisauto.github.io/images/salesforce_logger_pour_les_nuls/journaux_de_debug.png)

Une fois sur la page, il va faloir créer un "Indicateurs de trace de l'utilisateur". En effet, l'écriture des logs n'est pas activé en permanence.

Pour cela, on clique sur nouveau, on définit l'entité tracée - le plus simple étant de tracer l'utilisateur avec lequel on est connecté ex: "Admin Aramis" lorsqu'on fait des modifications directement dans SF. Sinon pour les appels venant de WS ou autre, l'utilisateur est "API".
Ensuite on rempli le niveau de débogage avec "SFDC_DevConsole" (petite feinte: remplir le champ directement avec un copier coller ne fonctionne pas. Il faut passer par la popin de resultat de recherche).
On evitera de changer la date d'expiration car pour du débug, on a rarement besoin d'avoir du log pendant plus de 30 minutes et ca évite d'oublier de désactiver la chose.

Une fois l'indicateur de trace créé, on peut gérer le niveau de log par catégories (DB, Code Apex, Workflow...) en cliquant sur "Filters", ce qui peut s'avérer utile pour éviter d'être complètement spammé.

Ensuite, il ne reste plus qu'à effectuer des tests et à ouvrir le journal de log qui nous intéresse et à chercher les débugs qu'on y a mis au préalable.



A défaut d'être passionnant, j'espère que cet article pourra au moins permetre à Stéphane de se décharger de quelques explications :D


<blockquote>Nicolas Pouille</blockquote>
