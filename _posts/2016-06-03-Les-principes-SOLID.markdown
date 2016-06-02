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


Dans cet exemple, La classe `CsvDataImporter` à deux casquettes:

- Lire un fichier CSV et transformer les données en tableaux PHP,
- Importer ces enregistrements dans une base de données MySQL.

Ce qui pose plusieurs problèmes:
- il faudra modifier la méthode loadFile si demain les données sont issues d'un fichier XML ou JSON
- Une réécriture de la méthode importData sera nécessaire s'il est question de charger ces données dans un Mongodb par exemple.

Une solution préférable est donc de décomposer la classe `CsvDataImporter` en deux sous-classes : `CsvFileLoader` et `DataGateway`. La nouvelle classe générique `DataImporter` n'a alors plus qu'à déléguer ces deux tâches à ses deux dépendances.

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


Note : les types des dépendances dans le constructeur de la classe DataImporter sont ici des classes abstraites ou des interfaces.

Avec ce découpage en trois petites classes, il est désormais plus facile de tester unitairement chaque objet, de faire évoluer les implémentations existantes ou d'en ajouter de nouvelles.

**Open Closed Principle (OCP)**

Le principe ouvert / fermé consiste à rendre les modules ouverts à l'extension et fermés aux modifications. En d'autres termes, il s'agit de pouvoir enrichir aisément les fonctionnalités d'un module sans avoir à en modifier son comportement.

Le dernier exemple présenté à la fin du principe de responsabilité unique se conforme en effet au principe ouvert / fermé. En effet, il est très facile de supporter de nouveaux formats de sérialisation des données ainsi que de nouveaux adapteurs pour des systèmes de stockage.

    $importer = new DataImporter(new CsvFileLoader(), new MySQLGateway());
    $importer = new DataImporter(new XmlFileLoader(), new MongoGateway());
    $importer = new DataImporter(new JsonFileLoader(), new ElasticSearchGateway());


Comme le montre le code ci-dessus, l'objet DataImporter n'a pas été modifié. Il s'agit juste de lui injecter de nouvelles implémentations des interfaces FileLoader et Gateway afin de pouvoir utiliser par exemple des données sérialisées en JSON à insérer dans une base MongoDB.

**Liskov Substitution Principle (LSK)**

Il s'agit ni-plus ni-moins que d'imposer le respect des prototypes d'une classe au niveau de ses filles. Une classe dérivée doit toujour se comporter comme sa mère afin que son utilisation soit rigoureusement identique: on doit pouvoir les substituer. Il faut également éviter de lever des exceptions imprévues ou modifier l'état de l'objet de manière inadaptée par rapport au comportement de la mère.

    <?php

    abstract class AbstractLoader implements FileLoader
    {
        public function load($file)
        {
            if (!file_exists($file)) {
                throw new \InvalidArgumentException(sprintf('%s does not exist.', $file));
            }

            return [];
        }
    }

    class CsvFileLoader extends AbstractLoader
    {
        public function load($file)
        {
            $records = parent::load($file);

            if (false !== $handle = fopen($file, 'r')) {
                while ($record = fgetcsv($handle)) {
                    $records[] = $record;
                }
            }
            fclose($handle);

            return $records;
        }
    }


Si toutes les classes concrètes dérivant la classe AbstractLoader conservent les mêmes types de paramètres d'entrée et de sortie, alors c'est qu'elles s'engagent à respecter le contrat de l'interface FileLoader. Par conséquent, il est possible de remplacer un objet CsvFileLoader par une instance de la classe XmlFileLoader dans le constructeur de la classe DataImporter.

**Interface Segregation Principle (ISP)**

Le principe de ségrégation d'interfaces est identique au principe de responsabilité unique des classes (SRP), mais à la différence qu'il s'applique aux interfaces.

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


**Dependency Injection Principle (DIP)**

Le dernier de ces 5 principes est le principe d’inversion des dépendances.
Stipule qu'il faille programmer par rapport à des abstractions plutôt que des implémentations.

Le code ci-dessous réalise complètement l'inverse puisque la classe DataImporter dépend directement de deux implémentations concrètes du fait de l'instanciation des deux classes CsvFileLoader et DataGateway.

    class DataImporter
    {
        private $loader;
        private $gateway;

        public function __construct()
        {
            $this->loader  = new CsvFileLoader();
            $this->gateway = new DataGateway();
        }
    }

Instancier les dépendances directement à l'intérieur du constructeur limite considérablement les capacités à étendre le code mais aussi à le tester. En effet, en codant en dur une instanciation avec le mot clé new, la classe DataImporter devient fortement couplée à sa dépendance CsvFileLoader. Cela signifie aussi qu'il est impossible de remplacer cette dépendance par une autre pour un besoin ultérieur. Aussi cela empêche de tester unitairement la classe DataImporter puisque les dépendances ne peuvent être remplacées par des "mocks".


    class DataImporter
    {
        private $loader;
        private $gateway;

        public function __construct(FileLoader $loader, Gateway $gateway)
        {
            $this->loader  = $loader;
            $this->gateway = $gateway;
        }
    }

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