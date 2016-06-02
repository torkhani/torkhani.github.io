---
layout: post
url: "/common/2016/04/22/Gestion-des-variables.html"
title:  "Gestion des variables"
author: "Issam Bezzina"
date:   2016-04-22 10:20:00 +0100
pitch:  "L'objectif de cet article est de voir comment PHP gére les variables"
comments: True
categories: common
---

Durant l'exécution d’un script PHP, les variables peuvent changer de type dynamiquement. Cette propriété fait de PHP un langage de programmation faiblement typé et hautement flexible. 

En interne, les variables sont représentées par une structure appelée "Zval" (Zend value) qui contient principalement le type et les informations relatives à la référence. Pour comprendre comment elles sont gérées, il faut comprendre d’abord comment elles sont stockées ensuite comment, pourquoi et dans quels cas utiliser des références.

Pour commencer, prenons un exemple simple :

```
<?php
$a = “foo”;
```
![figure1.png](http://aramisauto.github.io/images/gestion_des_variables/figure1.png)

Nous voyons la variable $a et nous voyons la zval qui représente son contenu : le type de la variable, sa valeur et les deux indicateurs suivants :

* is_ref : il vaut 0 si aucune affectation par référence n'a été faite et 1 sinon
* refcount : il contient le nombre de variables qui pointent sur la zval.

Pour tester, on peut utiliser la fonction PHP [debug_zval_dump()](http://php.net/manual/fr/function.debug-zval-dump.php) qui permet d'afficher un representation sous forme de chaîne de la zval d'une variable.

## Copy On Write ##
Avec la structure décrite précédemment, on a tendance à créer une zval pour chaque copie ou variable crée, et cela peut s'avérer coûteux en mémoire. Pour cette raison, PHP ne duplique la zval que lorsque c’est absolument nécessaire.
Prenons un exemple illustratif :

```
<?php
$a = "foo";
$b = $a;
$c = $b;
$b = "bar";
unset($a);
```
![figure2.png](http://aramisauto.github.io/images/gestion_des_variables/figure2.png)

Nous pouvons constater que dans la ligne 2 et 3, la zval n'est pas dupliquée et la mémoire n’est donc pas gaspillée. En effet, PHP ne duplique que lors de l’écriture (ligne 4) et ne supprime la zval que lorsque l’indicateur refcount est égale à 0. Nous pouvons voir qu’avec unset($a), la zval correspondante n’a pas été supprimée parce qu’il y a encore un symbole qui pointe dessus.

Maintenant, voyons ce qui se passera si on utilise les références.

## Les références ##
Prenons un exemple :

```
<?php
$a = "foo";
$b = &$a;
$b = 1;
```
![figure3.png](http://aramisauto.github.io/images/gestion_des_variables/figure3.png)

Dès qu’une variable est affecté par référence, l’indicateur is_ref passe à 1 . Et si l’un des symboles affectés par référence change sa valeur par la suite (ligne 3), le “Copy On Write” n’interviendra pas et c'est la zval elle-même qui va être changée.

Quand unset() est appelé sur une variable affecté par référence, la mémoire n’est pas automatiquement libérée mais la valeur de refcount est juste décrémentée de 1 et le symbole est détruit (même comportement lorsque l'affectation est faite par copie). Si l’indicateur is_ref vaut 1 et son refcount est égal à 1, alors is_ref passe à 0 car un seul symbole ne peut pas être une référence à lui-même.

Il est claire que copier un variable n’induit pas automatiquement la copie de la structure mémoire. Par conséquent, utiliser les références en pensant réduire la mémoire est absolument incorrecte. 

## Il faut faire attention avec les références ##

```
<?php
$a = array(‘a’, 4, 2);
foreach ($a as &$v) { }
foreach ($a as $v) { }
```

Que s'est-il passé dans l'exemple ci-dessus ?

A la fin du 1er foreach, $v est une référence sur la dernière case du tableau $a i.e. toute modification future de la variable $v changera la valeur de la dernière case du tableau. Cette modification aura donc lieu lors des itérations du 2ème foreach et remplira à chaque fois $v et donc la dernière case du tableau au même moment. Au final on aura $a égale à [‘a’, 4, 4].

Pour corriger ce code, il suffit d’utiliser unset($v) entre les deux foreach, ou encore utiliser autre chose que la variable $v dans le deuxième foreach ou ne pas utiliser de référence.

## Le cas des tableaux ##
Pour les tableaux, la logique précédente est appliquée et nous aurons donc une structure contenant plusieurs zval’s.
Prenons cette exemple illustratif:

```
<?php
$a = array("foo"=>"bar", 42);
$b = $a["foo"];
$c = $b;
$b = 18;
unset($a['foo']);
$a[0] = $b;
```
![figure4.png](http://aramisauto.github.io/images/gestion_des_variables/figure4.png)

Nous pouvons voir que le mécanisme reste le même. Notons bien que les clés d'un tableau ne sont pas des zval’s mais des indices permettant d'accéder aux zval’s ce qui permet ainsi de consommée très peu de mémoire.

**Rappel :**
Les clés d'un tableau ne peuvent être que des chaînes ou des entiers. Si ce sont des chaînes représentant des entiers alors PHP les transtypera en entiers.

## Les Fuites de mémoire ##
Avec un tableau, il est très facile de créer une fuite de mémoire.
Que se passera-t-il dans l'exemple ci-dessous ?

```
<?php
$a = array();
$a[] = &$a;
unset($a);
```

Dans la 2ème ligne, un élément sera créé dans le tableau en référence sur le tableau lui-même. Ainsi, une référence circulaire a été créé. Avec la 3ème ligne qui supprimera le symbole $a, la zval correspondante et qui représente le tableau restera en mémoire puisqu'elle a encore son indicateur refcount diffèrent de 0. le garbage collector n'aura alors aucun moyen de nettoyer la référence et de libérer la mémoire.

Depuis PHP 5.3.0, un algorithme a été ajouté pour résourde le promème des fuites mémoires dûes à des références circulaires.

**Rappel :**
Il est possible de forcer le passage du garbage collector à tout moment en utilisant la fonction [gc_collect_cycles()](http://php.net/manual/fr/function.gc-collect-cycles.php)

<blockquote>Issam Bezzina</blockquote>
