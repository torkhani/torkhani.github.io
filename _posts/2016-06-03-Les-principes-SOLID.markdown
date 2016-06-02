---
layout: post
url: "/common/2016/06/03/Les-principes-solid.html"
title:  "Les principes solid"
author: "Moetez Torkhani"
date:   2016-06-12 14:33:00 +0100
pitch:  "L'objectif de cet article est de presenter les principes SOLID."
comments: True
categories: common
---

**Le principe SOLID**

SOLID définit cinq bonnes pratiques orientées objet à appliquer au code afin d'en simplifier la maintenance, la testabilité et les évolutions futures.

SOLID est acronyme regroupant les principes suivants :
- Single Responsability Principle (SRP),
- Open Closed Principle (OCP),
- Liskov Substitution Principle (LSK),
- Interface Segregation Principle (ISP),
- Dependency Injection Principle (DIP)

**Single Responsability Principle (SRP)**

Comme son nom l’indique, ce principe signifie qu’une classe ne doit posséder qu’une et une seule responsabilité.
Si une classe a plus d’une responsabilité, ces dernières se retrouveront liées. Les modifications apportées à une responsabilité impacteront l’autre, augmentant la rigidité et la fragilité du code.


    <?php
    class User
    {
        public function login($user, $password)
        {
            // si la session n'existe pas encore, il faut l'initialiser
            if (!session_id()) {
                 session_start();
            }
            // rechercher dans la table user un utilisateur avec ce couple login / mot de passe
            $sth = $this->pdo->query("SELECT * FROM users WHERE username='$user' AND password='$password'");
            // si il y a des résultats
             if ($sth->rowCount()) {
                // hydrater l'objet courant
                $this->data = $sth->fetch(PDO::FETCH_ASSOC);
                // enregistrer l'utilisateur courant sur la session
                $_SESSION['logged'] = true;
                $_SESSION['user'] = $this;
                return true;
             } else {
                return false;
             }
        }
    }


Dans cet exemple , La méthode `login` à deux casquettes: elle se charge de trouver les données de l'utilisateur et de gêrer la session. Ce qui pose plusieurs problèmes:
- si on change la structure de la table users, alors tous les scripts qui dépendent du contenu de $_SESSION['user'] sont potentiellement invalides
- si on décide de changer la méthode d'authentification, alors il faut également changer la classe User et potentiellement la requête de sélection
- on ne peut pas écrire simplement les tests unitaires de cette méthode car elle utilise la superglobale $_SESSION

Une solution préférable est donc de séparer ces deux responsabilités:


    class User
    {
          public function getUserFromLoginPassword($user, $password)
          {
              // rechercher dans la table user un utilisateur avec ce couple login / mot de passe
              $sth = $this->pdo->query("SELECT * FROM users WHERE username='$user' AND password='$password'");
             if ($sth->rowCount()) {
                 $this->data = $sth->fetch(PDO::FETCH_ASSOC);
                 return $this;
             } else {
                 return null;
             }
          }
    }
    class Security
    {
         public function authenticate($user, $password)
         {
             $user = new User;
             // rechercher l'utilisateur correspondant
             if ($user->getUserFromLoginPassword($user, $password)) {
                 // si la session n'existe pas encore, il faut l'initialiser
                 if (!session_id())
                     session_start();
                 // enregistrer l'utilisateur courant sur la session
                 $_SESSION['logged'] = true;
                 $_SESSION['user'] = $user;
                 return true;
             } else {
                 return false;
             }
         }
    }

On dirait pourtant que ça ne change pas grand-chose au final. On a juste déplacé du code d'un point A à un point B. Pourtant il y a une différence fondamentale entre ces deux codes: tant que la méthode User::getUserFromLoginPassword conservera son prototype (i.e. son nom et ses arguments), la classe Security pourra fonctionner en parfaite autonomie et on n'aura pas à changer la classe User si on doit changer la méthode de login. De plus, il devient désormais possible de tester exhaustivement la classe User.

**Open Closed Principle (OCP)**

Le principe ouvert / fermé consiste à rendre les modules ouverts à l'extension et fermés aux modifications. En d'autres termes, il s'agit de pouvoir enrichir aisément les fonctionnalités d'un module sans avoir à en modifier son comportement.

    <?php
    class Vehicle
    {
      public function __construct($engineType)
      {
          switch ($engineType) {
              case 'fuel':
                  $this->engine = new FuelEngine;
                 break;
             case 'diesel':
                 $this->engine = new DieselEngine;
                 break;
             case 'electric':
                 $this->engine = new ElectricEngine;
                 break;
         }
     }
    }
    ?>

Ma voiture roule au GPL. Mais ce cas n'est visiblement pas géré par le constructeur de Car. Dans l'exemple ci-dessus, mes seules alternatives sont:
- ajouter à la main case 'gpl' dans le swich
- étendre Car en GplCar en surchargeant son constructeur

Il eut été préférable de pouvoir passer directement un objet moteur (engine) au constructeur afin qu'on soit libre de choisir quel moteur on veut pour la voiture:

    <?php
      class Car
      {
          public function __construct(Engine $engine)
          {
              $this->engine = $engine;
          }
      }
    ?>

**Liskov Substitution Principle (LSK)**

Il s'agit ni-plus ni-moins que d'imposer le respect des prototypes d'une classe au niveau de ses filles. Une classe dérivée doit toujour se comporter comme sa mère afin que son utilisation soit rigoureusement identique: on doit pouvoir les substituer. Il faut également éviter de lever des exceptions imprévues ou modifier l'état de l'objet de manière inadaptée par rapport au comportement de la mère.

    <?php
      class Rectangle
      {
          public function setDimentions($width, $width)
          {
              if ($with <= 0 || $height <= 0)
                  throw new InvalidArgumentException("with or height cannot be null or negative");
             $this->width  = $width;
             $this->height = $height;
          }
      }
     class Square extends Rectangle
     {
         public function setDimentions($width, $height)
         {
             if (!$width == $height)
                 throw new UnexpectedValueException("width should be equal to height");
             parent::setDimentions($width, $height);
         }
     }

**Interface Segregation Principle (ISP)**

Les client ne devraient pas dépendre de méthodes qu'ils n'utilisent pas. On pourrait presque y voir une forme d'héritage fonctionnel: une interface ne devrait pas déclarer plus d'un ensemble cohérent de méthodes. On parle aussi d'interfaces de rôles.

<?php
  interface UserInterface
  {
      public function login($user, $password);
      public function logout();
      public function isConnected();
     public function isAdmin();
     public function getRights();
 }
 class User implements UserInterface
 {
 }

Ici l'interface UserInterface présente deux rôles: la gestion du login ainsi que la gestion des droits. Il eut été préférable de séparer ces deux rôles dans deux interfaces séparées, quitte à les réunir par la suite dans l'implémentation concrête de la classe User:

<?php
 interface LoginInterface
  {
      public function login($user, $password);
      public function logout();
      public function isConnected();
 }
 interface PermissionInterface
 {
     public function isAdmin();
     public function getRights();
 }
 class User implements LogginInterface, PermissionInterface
 {
 }

Cette aproche est beaucoup plus souple car désormais les classes clientes pourront utiliser les instances de LoginInterface et PermissionInterface suivant leur besoin sans se retrouver obligé de supporter d'autres méthodes que celles décrites par le rôle qu'elles veulent utiliser. Par exemple, un composant qui ne s'occupe que de vérifier qu'un utilisateur dispose bien des droits d'accès à une ressource se fiche pas mal des méthodes de LoginInterface.
Il faut cependant faire attention à ne pas trop segmenter les rôles et se retrouver ainsi avec une multitude d'interfaces. Ici encore, il faut faire preuve de bon sens.

**Dependency Injection Principle (DIP)**

Le dernier de ces 5 principes est le principe d’inversion des dépendances (D pour Dependency Inversion).

class EBookReader
  {
      private $book;
      function __construct(PDFBook $book)
      {
          $this->book = $book;
     }
     function read()
     {
         return $this->book->read();
     }
 }
 class PDFBook
 {
     function read()
     {
         echo "reading a pdf book.";
     }
 }

Imaginons un instant que le scénario suivant: vous travaillez pour un éditeur de livres en ligne dont le choix initial était de proposer des livres au format PDF. Vous avez alors créé la classe PDFBook pour représenter les entrées de la table pdf_books ainsi que la liseuse EBookReader et tout fonctionne bien.
Jusqu'au jour où un commercial vient vous voir avec une idée révolutionnaire ! On va se plugger sur l'API d'un partenaire pour proposer la lecture de ses bouquins au travers de notre interface afin d'augmenter pour l'utilisateur la taille de la bibliothèque. Chouette ! A ceci près que l'API vous envoie des fichiers au format ePub, illisibles par votre liseuse. Vous êtes donc obligé de mettre à jour EBookReader en ajoutant la gestion du nouveau format:

<?php
  class EBookReader
  {
      private $book;
      function __construct($book)
      {
          if (!$book instanceof EPubBook && !$book instanceof PDFBook)
             throw new InvalidArgumentException("invalid book");
         $this->book = $book;
     }
     function read()
     {
         return $this->book->read();
     }
 }
 class EPubBook
 {
     function read()
     {
         echo "reading a epub book.";
     }
 }

Puis vient le jour où on décide d'ajouter le format Docx, puis le format Kindle, puis le format TXT etc. En regardant en arrière, il aurait mieux valu que la liseuse accepte un type abstrat d'EBook plutôt qu'un type concrêt:

<?php
 interface EBook
  {
      public function read();
  }
  class EBookReader
  {
     private $book;
     function __construct(EBook $book)
     {
         if (!$book instanceof EPubBook && !$book instanceof PDFBook)
             throw new InvalidArgumentException("invalid book");
         $this->book = $book;
     }
     function read()
     {
         return $this->book->read();
     }
 }
 ?>

Désormais, vous pouvez créer autant de types d'EBook que vous voulez sans devoir toucher à la classe EBookReader à chaque fois.

**Utiliser les événements Symfony2 pour un code SOLID**

Prenons pour exemple, un service Symfony dont l'objectif est d'enregistrer les données d'un utilisateur issu d'un formulaire. Le code pourrait alors ressembler à quelque chose comme cela :

<?php
// Controller/UserController.php
public function newAction(Request $request)
{
  $user = new User();
  $form = $this->createForm();
  $form->handleRequest($request);
  if ($form->isValid()) {
    $manager = $this->get('app.user_manager');
    $manager->save($user);
    return $this->redirectToRoute('user_show', ['id' => $user->getId()]);
  }
  return [ 'form' => $form->createView() ];
}
// Manager/UserManager.php
public function save(User $user)
{
  $this->entityManager->persist($user);
  $this->entityManager->flush();
}
Ce code respecte bien le principe de responsabilité unique, chacune de nos classes n'a qu'un seul objectif. Mais imaginons maintenant que nous souhaitons envoyer un email à l'utilisateur que nous venons de créer.
Rien de difficile, il suffit alors de modifier notre manager pour envoyer le mail lors de la création du compte :
// Manager/UserManager.php
public function save(User $user)
{
  $this->entityManager->persist($user);
  $this->entityManager->flush();
  $this->emailManager->sendNewAccountNotification($user);
}
Sauf qu'en ajoutant cette ligne, nous venons de casser le principe de responsabilité unique de notre service gérant les utilisateurs. Réfléchissez bien, si vous souhaitez réutiliser la classe UserManager dans une autre application, mais que cette dernière ne souhaite pas envoyer de notification, comment allez-vous faire ?
Symfony2 nous permet d'éviter ce couplage très simplement, au travers de la gestion des événements. L'idée est très simple, une fois l'enregistrement du nouvel utilisateur effectué, nous allons émettre un signal afin d'indiquer le succès de la création. Ce signal pourra alors être capter par différentes classes afin de déclencher différentes actions (un envoi de notification dans notre exemple).
Commençons par modifier notre classe UserManager :

// Manager/UserManager.php
public function __construct(EventDispatcherInterface $dispatcher, ...)
{
  $this->dispatcher = $dispatcher;
  // ...
}
public function save(User $user)
{
  $this->entityManager->persist($user);
  $this->entityManager->flush();
  $this->dispatcher->dispatch('user.create', new UserEvent($user));
}

use Symfony\Component\EventDispatcher\Event;
class UserEvent extends Event
{
  private $user;
  public function __construct(User $user)
  {
    $this->user = $user;
  }
  public function getUser()
  {
      return $this->user;
  }
}

<?php
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
class UserNotificationListener implements EventSubscriberInterface
{
  private $emailManager;
  public function __construct(EmailManagerInterface $emailManager)
  {
    $this->emailManager = $emailManager;
  }
  public function onUserCreate(UserEvent $event)
  {
    $this->emailManager->sendNewAccountNotification($event->getUser());
  }
  public static function getSubscribedEvents()
  {
    return [
      'user.create' => 'onUserCreate',
    ];
  }
}


// Resources/config/services.yml
services:
  listener.user_mailer_notification:
    class: Listener\UserNotificationListener
    arguments:
      - @app.manager.email
    tags:
      - { name: kernel.event_subscriber }
**Source**
http://afsy.fr/avent/2013/02-principes-stupid-solid-poo
<blockquote>Moetez Torkhani</blockquote>