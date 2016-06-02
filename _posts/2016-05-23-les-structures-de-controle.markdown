---
layout: post
url: "/common/2016/05/23/les-structures-de-controle.html"
title: "Les structures de contrôle"
author: "Noura ELAbed"
date: 2016-05-23 14:00:00 +0100
pitch: "Cet article permet de présenter les structures de contrôle utilisés en programmation et les bonnes pratiques à suivre pour optimiser la performance et la qualité du code. Il permet aussi de rappeler les recommandations PSR pour les structures de contrôles."
comments: True
categories: common
---

# Structures conditionnelles/ Alternatives:

## if
La structure conditionnelle if permet d'exécuter une instruction ou un ensemble d'instructions selon des conditions bien définis. Avec le if, on peut utiliser ifelse et else. Le code lié au ifelse ne sera exécuté que lorsque son expression est évaluée à TRUE. Par contre, le traitement du else correspond au traitement par défaut lorsque les expressions du if et elseif sont évaluées à FALSE.

### Syntaxe:

    <?php
    If (<condition 1>) {
        <instructions bloc 1>               
    } elseif (<condition 2>) {
        <instructions bloc 2>
    } else {
        <instructions bloc 3>
    }

On peut remplacer if/else par l’opérateur ```?```

### Exemple :

    <?php
    $val = ($a==1 ?5 :10);

L’utilisation de cet opérateur permet d’améliorer la visibilité du code. En plus, il est très pratique dans le cas où on veut faire un autre traitement lié au résultat de la condition comme dans le cas suivant:

    <?php
    $val =$a* ($b==1 ?5 :10);

### Bonnes pratiques:

* L’utilisation des accolades est préférable dans le cas où le code à exécuter contient une seule instruction.
* En PHP on peut utiliser else if ou elseif. PSR recommande l'utilisation de elseif de telle sorte que tous les mots clés de contrôle sont construits par un seul mot.
* Le else et elseif doivent être alignés avec l'accolade fermante du bloc précédent.

## switch

L'utilisation de switch est équivalente à l'utilisation de if avec plusieurs conditions pour la même variable.

### Syntaxe

    <?php
    switch (<expression>) {
        case <valeur 1>:
            <instructions>
            Break;
        case <valeur 2>:
            <instructions>
            break;
        default:
            <instructions>
    }

Le mot clé ```break``` est utilisé pour pousser PHP à sortir du bloc switch. S'il n'est pas utilisé, ça permet d'évaluer à TRUE le case suivant.

### Bonnes pratiques

* Lors du développement, il faut faire attention à l'utilisation de break dans le switch. Si on oublie de mettre un break le case suivant est évalué à TRUE.Pour éviter ce genre des problèmes, PSR exige de mettre 'no break' en commentaire lorsqu'on ne veut pas l'utiliser dans un case avec bloc d'instructions.

### Exemple

    <?php
    switch ($expr) {
        case 0:
            echo 'première case';
            break;
        case 1:
            echo 'deuxième case';
            // no break
        case 2:
            echo 'troisième case';
            break;
        default:
            echo 'Default case';
            break;
    }

* Bien que le mot clé ```default``` est facultatif, il est recommandé de l'ajouter à la fin du switch pour l'exécution du traitement par défaut. Il est aussi recommandé de mettre un break dans le bloc du default.

# Structures itératives

## Boucle for

Cette structure est utilisée lorsqu'on veut répéter un traitement plusieurs fois tant que la condition est évaluée à TRUE et qu'on connaît d'avance le nombre d’itérations. Elle comporte trois paramètres qui sont généralement des instructions.  Le premier paramètre sert à initialiser une valeur qui sera incrémentée dans le troisième paramètre jusqu’à respecter la condition du deuxième paramètre.

### Syntaxe

    <?php 
    for (<initialisation> ; <condition> ; <incrémentation>) { 
        <instructions> 
    }

### Bonnes pratiques

* Le deuxième paramètre est évalué à chaque tour de boucle. Donc il est préférable d'utiliser des valeurs fixes dans la condition.

Voici un exemple à éviter car le count sera calculé à chaque itération :

    <?php
    for ($i=0; $i<count($a); $i++) {
        <instructions> 
    }

## Boucle while/do while

Le while permet de répéter un bloc d’instructions plusieurs fois tant que la condition de l’expression en paramètre est évaluée à FALSE. On l’utilise lorsqu’on ne sait pas d’avance le nombre d’itérations à effectuer.

### Syntaxe

    <?php
    while (<condition>) {
        <instructions>
    }

La structure do while ressemble au while mais les instructions du do while seront exécutées au moins une fois avant de vérifier la condition. Après,  les instructions seront exécutées tant que la condition est  évaluée à TRUE.

### Syntaxe:

    <?php 
    do { 
        <instructions> 
    } while (<condition>);

### Bonnes pratiques

*Il faut s'assurer que la condition sera évaluée à FALSE au moins une fois sinon le code entre dans un boucle infini.

## Boucle foreach

Cette structure est souvent utilisée en PHP. Elle permet de parcourir les éléments d’un tableau ou d'un objet. Il existe deux syntaxes pour cette structure. 

### Syntaxe 1

    <?php
    foreach (<tableau> as <element>) {
        <instructions>
    }

### Syntaxe 2

    <?php
    foreach (<tableau> as <clé> => <element>) {
        <instructions>
    }

Pour la première syntaxe, l'élément courant est assigné à la variable du deuxième paramètre element. La deuxième syntaxe permet d'assigner en plus la clé de l'élément courant au paramètre clé.

# Références

[PSR 2](http://www.php-fig.org/psr/psr-2/).

<blockquote>Noura ElABED</blockquote>
