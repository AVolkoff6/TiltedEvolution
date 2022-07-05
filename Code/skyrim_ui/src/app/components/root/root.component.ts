import {
  Component, ViewEncapsulation, HostListener, ViewChild,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Subscription } from 'rxjs';

import { ClientService } from '../../services/client.service';
import { SoundService, Sound } from '../../services/sound.service';

import { ChatComponent } from '../chat/chat.component';

import { animation as controlsAnimation } from './controls.animation';
import { animation as notificationsAnimation } from './notifications.animation';
import { animation as popupsAnimation } from './popups.animation';

import { environment } from '../../../environments/environment';
import { Player } from '../../models/player';

import { faCogs, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { PartyInfo } from 'src/app/models/party-info';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [controlsAnimation, notificationsAnimation, popupsAnimation],
  host: { 'data-app-root-game': environment.game.toString() }
})
export class RootComponent implements OnInit, OnDestroy {

  faCogs: IconDefinition = faCogs;

  @ViewChild('chat')
  private chatComp!: ChatComponent;

  private _view?: string;

  private activationSubscription: Subscription;
  private gameSubscription: Subscription;

  public constructor(
    private client: ClientService,
    private sound: SoundService
  ) {
  }

  public ngOnInit(): void {
    this.onInGameStateSubscription();
    this.onActivationStateSubscription();
  }

  public onInGameStateSubscription() {
    this.gameSubscription = this.client.inGameStateChange.subscribe(state => {
      if (!state) {
        this.view = undefined;
      }
    });
  }

  public onActivationStateSubscription() {
    this.activationSubscription = this.client.activationStateChange.subscribe(state => {
      if (this.inGame && state && !this.view) {
        setTimeout(() => this.chatComp.focus(), 100);
      }
      if (!state) {
        this.view = undefined;
      }
    });
  }

  public ngOnDestroy(): void {
    this.gameSubscription.unsubscribe();
    this.activationSubscription.unsubscribe();
  }

  public get openingMenu(): boolean {
    return this.client.openingMenuChange.value;
  }

  public get connected(): boolean {
    return this.client.connectionStateChange.value;
  }

  public get active(): boolean {
    return this.client.activationStateChange.value;
  }

  public get version(): string {
    return this.client.versionSet.value;
  }

  public get inGame(): boolean {
    return this.client.inGameStateChange.value;
  }

  public get isConnectionInProgress(): boolean {
    return this.client.isConnectionInProgressChange.value;
  }

  public set view(view: string | undefined) {
    this._view = view;

    if (view) {
      this.sound.play(Sound.Focus);
    }
    else if (this.chatComp) {
      this.chatComp.focus();
    }
  }

  public get view(): string | undefined {
    return this._view;
  }

  public get isProduction(): boolean {
    return environment.production;
  }

  public reconnect(): void {
    this.client.reconnect();
  }

  @HostListener('window:keydown.escape', ['$event'])
  // @ts-ignore
  private activate(event: KeyboardEvent): void {
    if (!this.view) {
      if (environment.game) {
        this.client.deactivate();
      } else {
        this.client.activationStateChange.next(!this.active);

        if (!this.connected) {

          this.client.connectionStateChange.next(true);

          this.client.playerConnectedChange.next(new Player(
            {
              id: 1,
              name: 'Dumbeldor',
              online: true,
              connected: true,
              level: 10,
              cellName: 'Falkreath',
              hasInvitedLocalPlayer: true
            }
          ));
          this.client.playerConnectedChange.next(new Player(
            {
              id: 2,
              name: 'Pokang',
              online: true,
              connected: true,
              level: 12,
              cellName: 'Whiterun'
            }
          ));
          this.client.playerConnectedChange.next(new Player(
            {
              id: 3,
              name: 'Cosideci',
              online: true,
              connected: true,
              level: 69,
              cellName: 'Whiterun'
            }
          ));
          this.client.isLoadedChange.next(new Player(
            {
              id: 1,
              isLoaded: true,
              health: 50
            }
          ));
          this.client.isLoadedChange.next(new Player(
            {
              id: 2,
              isLoaded: true,
              health: 75
            }
          ));
          this.client.isLoadedChange.next(new Player(
            {
              id: 3,
              isLoaded: true,
              health: 0
            }
          ));

          this.client.partyInfoChange.next(new PartyInfo(
            {
              playerIds: [1,2],
              leaderId: 0
            }
          ));

          this.client.localPlayerId = 0;

          let name = "Banana";
          let message = "Hello Guys";
          let dialogue = true;

          this.client.messageReception.next({ name, content: message, dialogue: dialogue })
        }
      }
    }

    event.stopPropagation();
    event.preventDefault();
  }


  @HostListener('window:keydown.f3', ['$event'])
  // @ts-ignore
  private testGroup(event: KeyboardEvent): void {
    if (!this.view) {
      if (environment.game) {
        this.client.deactivate();
      } else {
        this.client.partyInfoChange.next(new PartyInfo(
          {
            playerIds: [1],
            leaderId: 1
          }
        ));
      }
    }
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('window:keydown.f4', ['$event'])
  // @ts-ignore
  private testUnload(event: KeyboardEvent): void {
    if (!this.view) {
      if (environment.game) {
        this.client.deactivate();
      } else {
        this.client.isLoadedChange.next(new Player(
          {
            id: 2,
            isLoaded: false,
            health: 50
          }
        ));
      }
    }
    event.stopPropagation();
    event.preventDefault();
  }
}
