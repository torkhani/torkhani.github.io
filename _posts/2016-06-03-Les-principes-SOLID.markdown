---
layout: post
url: "/common/2016/06/03/Les-principres-solid.html"
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
    Single Responsability Principle (SRP),
    Open Closed Principle (OCP),
    Liskov Substitution Principle (LSK),
    Interface Segregation Principle (ISP),
    Dependency Injection Principle (DIP)


**Single Responsability Principle (SRP)**
Comme son nom l’indique, ce principe signifie qu’une classe ne doit posséder qu’une et une seule responsabilité.
Mais pourquoi me direz-vous ? Si une classe a plus d’une responsabilité, ces dernières se retrouveront liées.
Les modifications apportées à une responsabilité impacteront l’autre, augmentant la rigidité et la fragilité du code.

Dans l'exemple ci-dessous, la classe CsvDataImporter a pour rôle d'importer des données issues d'un fichier au format CSV.
La classe CsvDataImporter réalise deux tâches de nature complètement différente :

    Lire un fichier CSV et transformer les données en tableaux PHP,
    Importer ces enregistrements dans une base de données MySQL.


<?php

class CsvDataImporter
{
    public function import($file)
    {
        $records = $this->loadFile($file);

        $this->importData($records);
    }

    private function loadFile($file)
    {
        $records = array();
        if (false !== $handle = fopen($file, 'r')) {
            while ($record = fgetcsv($handle)) {
                $records[] = $record;
            }
        }
        fclose($handle);

        return $records;
    }

    private function importData(array $records)
    {
        try {
            $this->db->beginTransaction();
            foreach ($records as $record) {
                $stmt = $this->db->prepare('INSERT INTO ...');
                $stmt->execute($record);
            }
            $this->db->commit();
        } catch (PDOException $e) {
            $this->db->rollback();
            throw $e;
        }
    }
}


La solution pour se conformer au principe de responsabilité unique consiste à décomposer la classe CsvDataImporter en deux sous-classes : CsvFileLoader et DataGateway. La nouvelle classe générique DataImporter n'a alors plus qu'à déléguer ces deux tâches à ses deux dépendances.

<?php

class DataImporter
{
    private $loader;
    private $gateway;

    public function __construct(FileLoader $loader, Gateway $gateway)
    {
        $this->loader  = $loader;
        $this->gateway = $gateway;
    }
    public function import($file)
    {
        foreach ($this->loader->load($file) as $record) {
            $this->gateway->insert($record);
        }
    }
}


**Open Closed Principle (OCP)**
Le principe ouvert / fermé consiste à rendre les modules ouverts à l'extension et fermés aux modifications. En d'autres termes, il s'agit de pouvoir enrichir aisément les fonctionnalités d'un module sans avoir à en modifier son comportement.

<?php
    $importer = new DataImporter(new CsvFileLoader(), new MySQLGateway());
    $importer = new DataImporter(new XmlFileLoader(), new MongoGateway());
    $importer = new DataImporter(new JsonFileLoader(), new ElasticSearchGateway());


Comme le montre le code ci-dessus, l'objet DataImporter n'a pas été modifié. Il s'agit juste de lui injecter de nouvelles implémentations des interfaces FileLoader et Gateway afin de pouvoir utiliser par exemple des données sérialisées en JSON à insérer dans une base MongoDB.

**Liskov Substitution Principle (LSK)**

**Interface Segregation Principle (ISP)**

**Dependency Injection Principle (DIP)**

Le dernier de ces 5 principes est le principe d’inversion des dépendances (D pour Dependency Inversion).




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

