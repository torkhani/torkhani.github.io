---
layout: post
url: "/common/2016/04/12/Gestion-des-valeurs-par-defaut.html"
title:  "Gestion des valeurs par défaut"
author: "Yoram Griguer"
date:   2016-04-12 14:33:00 +0100
pitch:  "L'objectif de cet article est de voir comment gérer les valeurs par défaut en PHP de manière élégante."
comments: True
categories: common
---

Durant le développement de nos nombreux applicatifs, nous sommes tous confrontés à une problèmatique récurrente : la gestion des valeurs par défaut. En effet, lorsque nous voulons remplir des variables avec des données fournies en entrée, nous voulons nous assurer que la donnée en entrée est bien présente. Si nous faisons ce test à la main, cela amène des syntaxes très verbeuses qui augmentent énormément la complexité cyclomatique des algorithmes, pour au final pas grand chose. L'objectif de cet article est par conséquent de montrer (ou rappeler) les méthodes qui existent pour faire cela de manière élégante, compréhensible et facilement maintenable.

**Ce qu'il faut éviter de faire**

Voici un exemple de code que nous avons tous fait un jour ou l'autre :

	public function generateOutputFromInput(array $input)
	{
		$output = array();

		$output['o1'] = isset($input['i1']) ? $input['i1'] : null;
		$output['o2'] = isset($input['i2']) ? $input['i2'] : null;
		$output['o3'] = isset($input['i3']) ? $input['i3'] : 0;
		$output['o4'] = isset($input['i4']) ? $input['i4'] : '';
		$output['o5'] = isset($input['i5']) ? $input['i5'] : '';

		return $output;
	}

Dans cet exemple, nous voulons remplir les valeurs *o1*, *o2*, *o3*, *o4* et *o5* de `$output` à partir des valeurs *i1*, *i2*, *i3*, *i4* et *i5* de `$input`. Cette méthode est à proscrire pour plusieurs raisons :

- elle est difficilement lisible
- elle augmente considérablement la complexité cyclomatique de la méthode, et à chaque ligne ajoutée cela empire !
- elle nous fait répéter la clé d'entrée dans la condition ternaire, ce qui est une source d'erreur lorsqu'elle est amenée à changer

Par conséquent, je vous conseille d'éviter d'utiliser cette syntaxe au maximum et d'utiliser plutôt ce qui vient ci-dessous.


**Ce qu'il faut faire**

Reprenons le même exemple, mais en passant par un tableau intermédiaire qui définirait les valeurs par défaut, et un `array_merge` qui permet d'avoir les valeurs de `$input` si elles sont définies et les valeurs par défaut sinon :

	public function generateOutputFromInput(array $input)
	{
		$input = array_merge(
			[
				'i1' => null,
				'i2' => null,
				'i3' => 0,
				'i4' => '',
				'i5' => ''
			],
			$input
		);

		$output = [
			'o1' => $input['i1'],
			'o2' => $input['i2'],
			'o3' => $input['i3'],
			'o4' => $input['i4'],
			'o5' => $input['i5']
		];

		return $output;
	}

Dans cet exemple, grâce au `array_merge`, la seconde version du tableau `$input` a obligatoirement les clés *i1*, *i2*, *i3*, *i4* et *i5*, soit avec la valeur par défaut, soit avec la valeur fournie dans le tableau `$input` d'origine. Ainsi, notre méthode ne contient plus aucune condition et la complexité cyclomatique est réduite à 1.
A noter : faites attention à l'ordre dans la fonction `array_merge`, il faut que `$input` soit en deuxième pour que ses valeurs prennent le pas sur les valeurs par défaut.


**Et avec un tableau de profondeur n >= 2 ?**

Si nous essayons d'appliquer la solution précédente à un tableau en entrée qui a une profondeur supérieure ou égale à 2, l'utilisation du `array_merge` va nous poser des problèmes quant à la définition des valeurs par défaut. En effet, prenons le simple exemple ci-dessous :

	$default = [
		'a' => [
			'b' => 'c',
			'd' => 'e',
		]
	];

	$input = [
		'a' => [
			'd' => 'f'
		]
	];

	$merge = array_merge($default, $input);

Le résultat est le suivant : 

	[
		'a' => [
			'd' => 'f'
		]
	];

Nous voyons que la définition de la valeur par défaut de la clé *b* a disparu car c'est le tableau *a* en entier de `$input` qui a pris le pas sur celui de `$default`. Ce que nous aurions souhaité avoir aurait plutôt été de la forme :

	[
		'a' => [
			'b' => 'c',
			'd' => 'f'
		]
	];

Pour cela, il faut utiliser la fonction PHP `array_replace_recursive`. Elle fonctionne exactement comme nous le souhaitons : si, à n'importe quel niveau, une valeur existe dans les deux tableaux, c'est la valeur du tableau de droite qui va être gardée. Si une valeur n'existe que dans l'un des deux tableaux, elle est gardée également.
Il ne faut surtout pas la confondre avec la fonction `array_merge_recursive` qui, si une valeur existe dans les deux tableaux, va créer un sous-tableau avec ces deux valeurs et ainsi donner le résultat suivant :

	[
		'a' => [
			'b' => 'c',
			'd' => ['e', 'f']
		]
	];


**Un cas particulier**

Maintenant que nous avons posé les bases, il me semble intéressant d'évoquer un cas que je rencontre par moments. Voici un petit exemple concret :

Imaginons un applicatif qui poste en JSON à un webservice le tableau `['name' => 'toto', 'color' => null]`. Ici, nous ne connaissons pas la couleur de l'enregistrement et nous souhaitons lui attribuer une couleur par défaut. Si nous n'envoyons pas du tout la couleur (et donc le tableau `['name' => 'toto']`), la gestion de la couleur par défaut se fait facilement avec les exemples cités plus haut. Mais ici, comme la couleur est effectivement envoyée, avec une valeur nulle, si nous gérons la couleur par défaut de manière classique, nous allons nous retrouver avec un enregistrement de couleur nulle car c'est la valeur du tableau d'entrée qui va primer, comme illustré ci-dessous :

	public function generateOutputFromInput(array $input)
	{
		$input = array_merge(
			[
				'name' => 'titi',
				'color' => 'bleu'
			],
			$input
		);

		$output = [
			'name' => $input['name'],
			'color' => $input['color']
		];

		return $output;
	}

Ici, `$ouput['color']` est égal à `null`. Dans ces cas-là, je force les valeurs par défaut directement dans l'attribution des valeurs à `$ouput`. Le premier `array_merge` sert alors uniquement à s'assurer que la clé existe, mais ne sert plus à définir les valeurs par défaut : 

	public function generateOutputFromInput(array $input)
	{
		$input = array_merge(
			[
				'name' => null,
				'color' => null
			],
			$input
		);

		$output = [
			'name' => $input['name'] ?: 'titi',
			'color' => $input['color'] ?: 'bleu'
		];

		return $output;
	}

C'est moins élégant et ajoute de la complexité cyclomatique à la méthode mais c'est toujours plus propre, lisible et maintenable qu'avec tous les `isset()`.


**Attention aux abus**

Cette méthode est une bonne pratique à utiliser le plus possible, mais il ne faut pas l'utiliser aveuglément. De même, l'utilisation des `isset()` et `!empty()` n'est pas diabolique et peut (doit !) être utilisée dans certains cas. Par exemple, il arrive que nous voulions remplir une valeur de `$output` seulement si une certaine valeur de `$input` est définie (et éventuellement non-vide). A ce moment-là l'utilisation d'une condition `isset()` (ou `!empty()`) est impérative et la bonne pratique faisant l'objet de cet article ne pourra en aucun cas la remplacer.

J'espère que cet article vous sera utile. N'hésitez pas à revenir vers moi si vous avez des remarques et/ou des suggestions.

Bon développement à tous !

<blockquote>Yoram Griguer</blockquote>
