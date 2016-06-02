---
layout: post
url: "/common/2016/05/13/le-lean-dans-le-developpement.html"
title:  "Le LEAN dans le développement"
author: "Kevin Arbouin"
date:   2016-05-13 14:00:00 +0100
pitch:  "Nous allons voir brièvement comment appliquer le LEAN dans le développement"
comments: True
categories: common
---

## Qu'est ce que le LEAN ?

Le `Lean` (de l'anglais **lean**, "maigre", "sans gras", "dégraissé") est qualifié de théorie de gestion `au plus juste`. Elle a vu le jour au japon dans le système de production de Toyota.

L'école de philosophie du `Lean` est marqué par la recherche de performance (en matière de **productivité**, de **qualité**, de délais et enfin de coûts) censée être plus facile à atteindre par l'amélioration continue et l'élimination des gaspillages (`muda` en japonnais), afin d'améliorer la valeur globale pour le client.

les gaspillages sont au nombre de sept :

* surproduction,
* attentes,
* transport,
* étapes inutiles,
* stocks,
* mouvements inutiles,
* corrections/retouches.

## Le Lean Management

Le `lean management` est un organisation du travail qui cherche à mettre à contribution l'ensemble des acteurs. Il a pour objectif de supprimer au maximum les trois "démons" de l'organisation du travail :

* Muda : tout ce qui n'a pas de valeur,
* Muri : l’excès, la surcharge de travail engendrée par des processus non adaptés,
* Mura : la variabilité, ou l’irrégularité.

Le `Lean` conseille mais n'impose pas comme d'autre méthodoligie plus stricte. Ce qui permet d'adapter au besoin du projet.

### "Software development"

Le `Lean` s'appuie sur la qualité ainsi que la productivité, pour cela il pouvoir produire le besoin client et de qualité. Plus nous limiterons les aller/retour pour corriger les bugs ou bien parce que le besoin est mal définit à la base, plus nous augmenterons la qualité du produit.

Il faut s'appuyer sur des outils afin d'améliorer la qualité, limiter les régressions, etc.

Par exemple il faut permetre d'annuler une modification dans le code le plus rapidetment possible. Pour cela il faut utiliser des outils de gestion de version tel que SVN, GIT ou autres.
Voici la liste des actions à faire avec l'ordre conseillé :

* Les outils de gestion du sources,
* Les tests automatiques,
* L'integration continue,
* Développer moins de code,
* Impliquer le client tout au long du développement.

Le `Lean` à pour approche de ne mettre en place un nouveau processus uniquement s'il devient indispensable. Par exemple si le projet commence de zéro, il n'est pas essentiel de mettre en place l'intégration continue dés le début. C'est une perte d'argent et de temps pour un projet qui début et pour lequel nous n'avons pas vision client.

#### Les outils de gestion de sources

L'intérêt de la gestion de source en configuration est de pouvoir enregistrer les itérations et de rapidement revenir en arrière si nécessaire, d'identifier les modifications apportées à une version donnée, et d'identifier aussi qui a fait les modifications parmi l'équipe.

L'intérêt d'avoir un script de création code source est de pouvoir reproduire à l'identique une livraison logicelle et donc de limiter la varaibilité.

Il faudra définir une norme de codage très rapidement afin que la lecture ainsi que l'intervention sur le code soit plus simple pour toute l'équipe.

#### Les tests automatiques

Très souvant les tests unitaires, d'intégrations et fonctionnels sont délaissés considérer comme inutile et une énome perte de temps. **C'est une énorme erreur.**
Plus l'erreur ou la régrerssion est détectée tardivement plus son coût augmente de manière exponentielle.

 > A titre d'information, le corriger une faute d'orthographe découverte sur un projet en production coûte en moyenne 3 000 €. Beaucoup d'acteurs rentre en compte comme la personne qui à relevé l'erreur, qui la transmet au PO (Product Owner), qui va prioriser la demande, le développeur pour faire la correction et demander le déploiement à l'exploitation (les garants des plateformes de production), qui va déployer la nouvelle version du projet.

Enfin de limiter le gaspillage, il est important d'identifier les régressions ainsi que les limites des méthodes pour être sûr qu'elles répondent aux besoins métier.

Pour le développement, il est préconisé de mettre en place les tests unitaires au plutôt, parce que tout développeur sait que si ce n'est pas le cas, le faire plus tard prendra, en moyen, 2 fois plus de temps qu'appliqué au développement de la fonctionnalité et donc un coût bien plus important.

L’intérêt d’automatiser les tests est de permettre de les rejouer rapidement et sans coût excessif après chaque modification du code. En effet il est primordial d’identifier une erreur au plus près de son introduction, le coût de la correction augmentant au fur à mesure que le temps s’écoule, du fait de:

* L’ajout de nouvelles fonctionnalités qui vont complexifier la correction,
* La perte de la connaissance du code par le développeur qui a fait la modification,
* Le potentiel retro-portage de la correction dans des versions déjà livrées et re-livraisons.

Différent type de tests sont possible d'intégrer comme les tests unitaires, intégration, fonctionnels, avec les bases de données, etc.

#### L'integration continue

`L'intégration continue` est là aussi comme les tests automatiques une technique logicelle non spécifique au `Lean` mais permettant d'automatiser la conception du logiciel. L'ingération continue se déclenche automatiquement lorque que les sources sont mise à jour dans l'outil de gestion de version. Grâce à celle-ci, les tests automatiques sont executés de façon automatique après l'exécution du processus de déploiement. Il est possible de prévenir les développeurs, par courriel par exemple, en cas de problème survenu en pendant tout ces étapes.

L'intérêt d'avoir une procédure `d'intégration continue` permet de limiter la variabilité dans le processus de fabrication du logiciel et des tests. Mais aussi de limiter le temps entre l'introduction et la découverte d'un problème de régression dans le code.

#### Développer moins de code

Il est primordial de de réfactorer et factoriser le code régulièrement pour éliminer le code mort ou le code en doublon et avoir toujours l’architecture la plus simple possible (mais pas plus). Il est important de limiter le code pour avoir une base de code la plus simple et aussi la robuste.

Il faut impérativement remettre en question le plus souvent possible l'architecture mis en place par simple logique que l'architecture actuelle est adapter pour les fonctionnalités déjà développés mais pas forcément pour celles avenir.

C'est ici que prend tout son sens les outils permettant de détecter la qualité du code en prenant en compte la complexité cyclomatique, l'analyse de la duplication, etc.

#### Impliquer le client tout au long du développement

En `Lean` on demande à toujours fournir au client la qualité maximale possible, et pour cela il faut bien le connaitre et voir comment il utilise le produit.

Il est primordial de collecter et traiter les retours clients afin de faire évoluer le produit dans la vision client et non dans une vision définit par un besoin d'une personne.

> Kevin ARBOUIN
