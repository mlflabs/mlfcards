import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { waitMS } from '../../utils';
import { DictService } from '../../services/dict.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPage implements OnInit, OnDestroy {

  settings;
  localSettings;

  private _settingsSub;
  private _localSettingsSub;

  constructor(public settingsService: SettingsService,
              public dictService: DictService,
              public cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this._settingsSub =  this.settingsService.settings$.subscribe(s => {
      console.log('Settings Page reload: ', s);
      this.settings = s;
      this.cdr.detectChanges();
    });
    this._localSettingsSub =  this.settingsService.localSettings$.subscribe(s => {
      console.log('Settings Page reload: ', s);
      this.localSettings = s;
      this.cdr.detectChanges();
    });

    this.localSettings = this.settings.localSettings;

    this.doubleCheckSettings();
  }

  async doubleCheckSettings() {
    console.log('Doublecheck settings:: ', this.settings);
    if(!this.settings) {
      await waitMS(100);
      this.settings = await this.settingsService.dataService.getDoc('settings');
      this.cdr.detectChanges();
    }
  }

  settingsChanged() {
    console.log('Saving settings');
    this.settingsService.saveSettings(this.settings);
  }

  localSettingsChanged() {
    console.log('LocalSettings Changed');
    this.settingsService.saveLocalSettings(this.localSettings);
  }

  ngOnDestroy(): void {
    if(this._settingsSub && !this._settingsSub.closed)
      this._settingsSub.unsubscribe();
    if(this._localSettingsSub && !this._localSettingsSub.closed)
      this._localSettingsSub.unsubscribe();
  }
}
